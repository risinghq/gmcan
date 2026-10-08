import { beforeEach, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";

import { app } from "../app.js";
import { atomic, db } from "../db/client.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { putObject } from "../lib/upload.js";
import { createNews } from "../services/news.service.js";

async function newsCount() {
  const row = await db
    .selectFrom("news")
    .select((eb) => eb.fn.countAll<number>().as("n"))
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

let authorId = 0;

beforeEach(async () => {
  await db.deleteFrom("news").execute();
  await db.deleteFrom("asset").execute();
  await db.deleteFrom("member").execute();
  const author = await db
    .insertInto("member")
    .values({
      dni: "40000001",
      email: "author@example.test",
      passwordHash: "x",
      firstName: "Autor",
      lastName: "Prueba",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode: "researcher",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .executeTakeFirstOrThrow();
  authorId = Number(author.insertId);
});

describe("atomic writes", () => {
  test("a failing statement rolls back the statements before it", async () => {
    const insert = () => db.insertInto("locale").values({ code: "zz" });

    await expect(atomic([insert(), insert()])).rejects.toThrow();
    expect(await db.selectFrom("locale").select("code").where("code", "=", "zz").execute()).toEqual([]);
  });

  test("a news item and its translations are created together or not at all", async () => {
    await expect(
      createNews({
        statusCode: "draft",
        authorId,
        newsKindCode: "general",
        translations: { xx: { title: "t", summary: "s", body: "b" } },
      } as never),
    ).rejects.toThrow();
    expect(await newsCount()).toBe(0);
  });

  test("child rows point at the parent the same batch inserted", async () => {
    const id = await createNews({
      statusCode: "draft",
      authorId,
      newsKindCode: "general",
      translations: { es: { title: "t", summary: "s", body: "b" }, en: { title: "t", summary: "s", body: "b" } },
    });
    const translations = await db.selectFrom("news_translation").select("newsId").where("newsId", "=", id).execute();
    expect(translations).toHaveLength(2);
  });
});

describe("email", () => {
  test("the contact form reports that email is not configured", async () => {
    const res = await app.request("/api/email/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ana", reason: "Quiero unirme", email: "ana@example.test", phone: "999" }),
    });
    expect(res.status).toBe(503);
    expect(((await res.json()) as any).error.message).toBe("Email is not configured");
  });

  test("a password reset gives the same refusal for known and unknown addresses and stores no token", async () => {
    const request = (email: string) =>
      app.request("/api/email/password-reset/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
    const known = await request("author@example.test");
    const unknown = await request("nobody@example.test");
    expect([known.status, unknown.status]).toEqual([503, 503]);
    const withoutTrace = async (res: Response) => {
      const { traceId: _traceId, ...error } = ((await res.json()) as any).error;
      return error;
    };
    expect(await withoutTrace(known)).toEqual(await withoutTrace(unknown));
    expect(await db.selectFrom("password_reset").select("tokenHash").execute()).toEqual([]);
  });
});

describe("caching", () => {
  test("public reads may be shared and admin reads may not", async () => {
    const methods = await app.request("/api/methods");
    expect(methods.status).toBe(200);
    expect(methods.headers.get("cache-control")).toBe("public, max-age=60");

    const admin = await app.request("/admin/account/me");
    expect(admin.status).toBe(401);
    expect(admin.headers.get("cache-control")).toBeNull();
  });

  test("a failed public read is not cacheable", async () => {
    const res = await app.request("/api/methods/999999");
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBeNull();
  });

  test("Kysely may run D1 queries concurrently", () => {
    expect(db.getExecutor().adapter.supportsMultipleConnections).toBe(true);
  });
});

describe("assets in R2", () => {
  test("a stored asset is served with its type and cache headers", async () => {
    await putObject("test/pixel.png", new Uint8Array([1, 2, 3]));
    const row = await db
      .insertInto("asset")
      .values({
        storageKey: "test/pixel.png",
        bucket: "r2",
        mimeDetected: "image/png",
        ext: "png",
        sizeBytes: 3,
        sha256: "0",
        visibility: "public",
        lifecycleStatus: "active",
        createdBy: null,
        createdAt: "2026-01-01",
        deletedAt: null,
      })
      .executeTakeFirstOrThrow();

    const res = await app.request(`/api/assets/${row.insertId}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("content-length")).toBe("3");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  test("a private asset is never cacheable by a shared cache", async () => {
    await putObject("test/secret.png", new Uint8Array([9]));
    const row = await db
      .insertInto("asset")
      .values({
        storageKey: "test/secret.png",
        bucket: "r2",
        mimeDetected: "image/png",
        ext: "png",
        sizeBytes: 1,
        sha256: "2",
        visibility: "private",
        lifecycleStatus: "active",
        createdBy: null,
        createdAt: "2026-01-01",
        deletedAt: null,
      })
      .executeTakeFirstOrThrow();
    const expires = Math.floor(Date.now() / 1000) + 60;
    const token = createHmac("sha256", "test-secret").update(`${row.insertId}:${expires}`).digest("hex");

    const res = await app.request(`/api/assets/${row.insertId}?expires=${expires}&token=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  test("an asset whose object is missing is not found", async () => {
    const row = await db
      .insertInto("asset")
      .values({
        storageKey: "test/missing.png",
        bucket: "r2",
        mimeDetected: "image/png",
        ext: "png",
        sizeBytes: 1,
        sha256: "1",
        visibility: "public",
        lifecycleStatus: "active",
        createdBy: null,
        createdAt: "2026-01-01",
        deletedAt: null,
      })
      .executeTakeFirstOrThrow();
    expect((await app.request(`/api/assets/${row.insertId}`)).status).toBe(404);
  });
});

describe("password hashing", () => {
  test("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });

  test("salts each hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });
});
