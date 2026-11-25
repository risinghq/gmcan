import { beforeEach, describe, expect, test } from "bun:test";

import { ErrorEnvelopeSchema } from "@gmcan/contracts/error";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { app } from "../app.js";
import { db } from "../db/client.js";
import { putObject } from "../lib/upload.js";
import { onError } from "../middleware/error.js";
import { createNews } from "../services/news.service.js";
import { storedPasswordHash } from "./fixtures.js";

const EMAIL = "ana.torres@example.test";
const PASSWORD = "correct horse battery";

let memberId = 0;

async function insertMember(roleCode: "administrator" | "researcher") {
  await db.deleteFrom("session").execute();
  await db.deleteFrom("news").execute();
  await db.deleteFrom("asset").execute();
  await db.deleteFrom("member").execute();
  const result = await db
    .insertInto("member")
    .values({
      dni: "20000001",
      email: EMAIL,
      passwordHash: await storedPasswordHash(PASSWORD),
      firstName: "Ana",
      lastName: "Torres",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      roleCode,
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .executeTakeFirstOrThrow();
  memberId = Number(result.insertId);
}

async function cookieFor(roleCode: "administrator" | "researcher") {
  await insertMember(roleCode);
  const res = await send("POST", "/admin/auth/login", { email: EMAIL, password: PASSWORD });
  return res.headers.get("set-cookie")!.split(";")[0]!;
}

function send(method: string, path: string, body?: unknown, cookie?: string) {
  return app.request(path, {
    method,
    headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function insertNews() {
  return createNews({
    statusCode: "published",
    authorId: memberId,
    newsKindCode: "general",
    translations: { es: { title: "t", summary: "s", body: "b" }, en: { title: "t", summary: "s", body: "b" } },
  });
}

function assetForm(newsId: number, file: File) {
  const form = new FormData();
  form.set("ownerType", "news");
  form.set("ownerId", String(newsId));
  form.set("slot", "photo");
  form.set("file", file);
  return form;
}

async function expectError(res: Response, status: number, code: string) {
  const text = await res.text();
  expect(res.status).toBe(status);
  expect(res.headers.get("content-type")).toContain("application/json");
  const parsed = ErrorEnvelopeSchema.safeParse(JSON.parse(text));
  expect(parsed.success).toBe(true);
  expect(parsed.data?.error).toMatchObject({ status, code });
  expect(parsed.data?.error.traceId).toBeTruthy();
}

beforeEach(async () => {
  await insertMember("researcher");
});

describe("public content", () => {
  test("an unknown item is not_found", async () => {
    await expectError(await send("GET", "/api/methods/999999"), 404, "not_found");
    await expectError(await send("GET", "/api/news/999999"), 404, "not_found");
    await expectError(await send("GET", `/api/members/999999`), 404, "not_found");
  });

  test("a malformed parameter is invalid_request with the issues in details", async () => {
    const res = await send("GET", "/api/methods/abc");
    const { error } = (await res.clone().json()) as { error: { details: unknown } };
    expect(Array.isArray(error.details)).toBe(true);
    await expectError(res, 400, "invalid_request");
  });
});

describe("public email", () => {
  test("an invalid body is invalid_request", async () => {
    await expectError(await send("POST", "/api/email/contact", { name: "" }), 400, "invalid_request");
    await expectError(
      await send("POST", "/api/email/password-reset/request", { email: "nope" }),
      400,
      "invalid_request",
    );
  });

  test("an invalid reset token is invalid_request", async () => {
    await expectError(await send("POST", "/api/email/password-reset/verify", { token: "x" }), 400, "invalid_request");
    await expectError(
      await send("POST", "/api/email/password-reset/confirm", { token: "x", newPassword: "long enough" }),
      400,
      "invalid_request",
    );
  });

  test("unconfigured email is upstream_failure 503", async () => {
    const res = await send("POST", "/api/email/contact", {
      name: "Ana",
      reason: "Quiero unirme",
      email: "ana@example.test",
      phone: "999",
    });
    await expectError(res, 503, "upstream_failure");
  });
});

describe("admin auth", () => {
  test("wrong credentials are unauthorized, whatever the reason", async () => {
    await expectError(
      await send("POST", "/admin/auth/login", { email: EMAIL, password: "wrong" }),
      401,
      "unauthorized",
    );
    await expectError(
      await send("POST", "/admin/auth/login", { email: "nobody@example.test", password: PASSWORD }),
      401,
      "unauthorized",
    );
  });

  test("a malformed body is invalid_request", async () => {
    await expectError(await send("POST", "/admin/auth/login", { email: "nope" }), 400, "invalid_request");
  });
});

describe("admin session and authorization", () => {
  test("no cookie is unauthorized", async () => {
    await expectError(await send("GET", "/admin/account/me"), 401, "unauthorized");
  });

  test("an unknown session is unauthorized", async () => {
    await expectError(await send("GET", "/admin/account/me", undefined, "sid=nope"), 401, "unauthorized");
  });

  test("a missing permission is forbidden", async () => {
    const cookie = await cookieFor("researcher");
    await expectError(await send("GET", "/admin/members", undefined, cookie), 403, "forbidden");
  });
});

describe("admin resources", () => {
  test("an unknown item is not_found", async () => {
    const cookie = await cookieFor("administrator");
    await expectError(await send("GET", "/admin/methods/999999", undefined, cookie), 404, "not_found");
    await expectError(await send("GET", "/admin/ref/journal/999999", undefined, cookie), 404, "not_found");
    await expectError(await send("GET", "/admin/members/999999", undefined, cookie), 404, "not_found");
  });

  test("an invalid body is invalid_request", async () => {
    const cookie = await cookieFor("administrator");
    await expectError(await send("POST", "/admin/methods", { nope: true }, cookie), 400, "invalid_request");
    await expectError(await send("PUT", `/admin/members/${memberId}`, { isActive: 3 }, cookie), 400, "invalid_request");
  });
});

describe("admin group content", () => {
  test("malformed stored content is an internal_error naming the field, not a client error", async () => {
    const cookie = await cookieFor("administrator");
    const group = await db
      .insertInto("research_group")
      .values({
        slug: "gmcan-error-shape",
        shortName: "GMCAN",
        fullName: "Group",
        address: null,
        email: null,
        phone: null,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })
      .executeTakeFirstOrThrow();
    const groupId = Number(group.insertId);
    const about = await db
      .insertInto("about")
      .values({ groupId, createdAt: "2026-01-01", updatedAt: "2026-01-01" })
      .executeTakeFirstOrThrow();
    const aboutId = Number(about.insertId);
    await db
      .insertInto("about_translation")
      .values({
        aboutId,
        locale: "es",
        description: "d",
        objectivesContent: "{}",
        servicesContent: "{}",
      })
      .execute();

    const res = await send("GET", `/admin/group/${groupId}/about`, undefined, cookie);
    const body = (await res.clone().json()) as { error: { details: unknown } };
    await expectError(res, 500, "internal_error");
    expect(body.error.details).toEqual({ field: `about:${aboutId}:es:objectivesContent` });

    await db.deleteFrom("research_group").where("id", "=", groupId).execute();
  });
});

describe("admin assets", () => {
  test("an invalid payload, a slot the owner lacks and a missing file are invalid_request", async () => {
    const cookie = await cookieFor("administrator");
    await expectError(await send("DELETE", "/admin/assets", { ownerType: "nope" }, cookie), 400, "invalid_request");
    await expectError(
      await send("DELETE", "/admin/assets", { ownerType: "news", ownerId: 1, slot: "cv" }, cookie),
      400,
      "invalid_request",
    );
    const form = new FormData();
    form.set("ownerType", "news");
    form.set("ownerId", "1");
    form.set("slot", "photo");
    const noFile = await app.request("/admin/assets", { method: "PUT", headers: { cookie }, body: form });
    await expectError(noFile, 400, "invalid_request");
  });

  test("a news photo uploads through PUT and soft-deletes through DELETE", async () => {
    const cookie = await cookieFor("administrator");
    const newsId = await insertNews();
    const put = await app.request("/admin/assets", {
      method: "PUT",
      headers: { cookie },
      body: assetForm(newsId, new File([new Uint8Array([1, 2, 3])], "photo.png", { type: "image/png" })),
    });
    expect(put.status).toBe(200);

    const binding = await db
      .selectFrom("news_asset")
      .innerJoin("asset", "asset.id", "news_asset.assetId")
      .select(["asset.id", "asset.lifecycleStatus", "asset.sizeBytes"])
      .where("news_asset.newsId", "=", newsId)
      .executeTakeFirstOrThrow();
    expect(binding).toMatchObject({ lifecycleStatus: "active", sizeBytes: 3 });

    const del = await send("DELETE", "/admin/assets", { ownerType: "news", ownerId: newsId, slot: "photo" }, cookie);
    expect(del.status).toBe(200);
    const after = await db
      .selectFrom("asset")
      .select("lifecycleStatus")
      .where("id", "=", binding.id)
      .executeTakeFirstOrThrow();
    expect(after.lifecycleStatus).toBe("soft_deleted");
  });

  test("a file whose extension the slot refuses is invalid_request", async () => {
    const cookie = await cookieFor("administrator");
    const newsId = await insertNews();
    const res = await app.request("/admin/assets", {
      method: "PUT",
      headers: { cookie },
      body: assetForm(newsId, new File([new Uint8Array([1])], "script.exe")),
    });
    await expectError(res, 400, "invalid_request");
  });

  test("an unknown owner or asset is not_found", async () => {
    const cookie = await cookieFor("administrator");
    await expectError(
      await send("DELETE", "/admin/assets", { ownerType: "news", ownerId: 999999, slot: "photo" }, cookie),
      404,
      "not_found",
    );
    await expectError(await send("POST", "/admin/assets/restore", { assetId: 999999 }, cookie), 404, "not_found");
  });
});

async function insertPrivateAsset(key: string) {
  await putObject(key, new Uint8Array([1]));
  const row = await db
    .insertInto("asset")
    .values({
      storageKey: key,
      bucket: "r2",
      mimeDetected: "image/png",
      ext: "png",
      sizeBytes: 1,
      sha256: key,
      visibility: "private",
      lifecycleStatus: "active",
      createdBy: null,
      createdAt: "2026-01-01",
      deletedAt: null,
    })
    .executeTakeFirstOrThrow();
  return Number(row.insertId);
}

describe("asset serving", () => {
  test("an unknown asset is not_found", async () => {
    await expectError(await send("GET", "/api/assets/999999"), 404, "not_found");
  });

  test("a private asset without a valid token is unauthorized", async () => {
    const id = await insertPrivateAsset("test/error-shape-private.png");
    await expectError(await send("GET", `/api/assets/${id}`), 401, "unauthorized");
    const expires = Math.floor(Date.now() / 1000) + 60;
    await expectError(await send("GET", `/api/assets/${id}?expires=${expires}&token=bad`), 401, "unauthorized");
  });
});

describe("requests no route handles", () => {
  test("an unknown path is not_found", async () => {
    await expectError(await send("GET", "/api/no-such-route"), 404, "not_found");
    await expectError(await send("GET", "/elsewhere"), 404, "not_found");
  });

  test("an HTTPException keeps a declared status and never blames the client for an undeclared one", async () => {
    const host = new Hono();
    host.onError(onError);
    host.get("/declared", () => {
      throw new HTTPException(409, { message: "Already there" });
    });
    host.get("/undeclared", () => {
      throw new HTTPException(429, { message: "Slow down" });
    });
    await expectError(await host.request("/declared"), 409, "conflict");
    await expectError(await host.request("/undeclared"), 500, "internal_error");
  });

  test("malformed JSON is invalid_request", async () => {
    const res = await app.request("/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    await expectError(res, 400, "invalid_request");
  });
});
