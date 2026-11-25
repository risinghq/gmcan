import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { app } from "../app.js";
import { db, queryInChunks } from "../db/client.js";
import { resolveMemberPhotoViews } from "../services/member-photo.service.js";
import { listAdminMembers, searchAuthorPool } from "../services/member.service.js";
import { createNews } from "../services/news.service.js";
import { countQueries } from "./query-counter.js";

async function insertAsset(owner: { table: "member_asset" | "news_asset"; column: "memberId" | "newsId"; id: number }) {
  const asset = await db
    .insertInto("asset")
    .values({
      storageKey: `uploads/test-${owner.table}-${owner.id}.png`,
      bucket: "r2",
      mimeDetected: "image/png",
      ext: "png",
      sizeBytes: 1,
      sha256: `${owner.table}-${owner.id}`,
      visibility: "public",
      lifecycleStatus: "active",
      createdBy: null,
      createdAt: "2026-01-01",
      deletedAt: null,
    })
    .executeTakeFirstOrThrow();
  await db
    .insertInto(owner.table)
    .values({
      [owner.column]: owner.id,
      slot: "photo",
      version: 1,
      assetId: Number(asset.insertId),
      actorId: null,
      reason: "upload",
      createdAt: "2026-01-01",
    } as never)
    .execute();
}

/* oxlint-disable no-await-in-loop -- foreign-key order and generated IDs require serial writes */
async function clear() {
  for (const table of ["session", "news_asset", "member_asset", "news", "asset", "member"] as const) {
    await db.deleteFrom(table).execute();
  }
}

afterAll(clear);

async function seed(rows: number) {
  await clear();
  for (let i = 0; i < rows; i++) {
    const member = await db
      .insertInto("member")
      .values({
        dni: `5000${String(i).padStart(4, "0")}`,
        email: `member${i}@example.test`,
        passwordHash: "x",
        firstName: "Ana",
        lastName: `Torres${i}`,
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
    const memberId = Number(member.insertId);
    await db
      .insertInto("member_translation")
      .values([
        { memberId, locale: "es", bio: "Investigadora" },
        { memberId, locale: "en", bio: "Researcher" },
      ])
      .execute();
    if (i % 2 === 0) await insertAsset({ table: "member_asset", column: "memberId", id: memberId });
    const newsId = await createNews({
      statusCode: "published",
      publishedAt: "2026-03-01",
      authorId: memberId,
      newsKindCode: "general",
      translations: {
        es: { title: `Noticia ${i}`, summary: "resumen", body: "cuerpo" },
        en: { title: `News ${i}`, summary: "summary", body: "body" },
      },
    });
    await insertAsset({ table: "news_asset", column: "newsId", id: newsId });
  }
}

/* oxlint-enable no-await-in-loop */

const listings: Record<string, () => Promise<unknown>> = {
  "/api/news": async () => (await app.request("/api/news?pageSize=50")).json(),
  "/api/members": async () => (await app.request("/api/members")).json(),
  "admin members": () => listAdminMembers("es"),
  "author search": () => searchAuthorPool("Ana"),
  "/api/search": async () => (await app.request("/api/search?q=Torres&types=members,news")).json(),
};

/* oxlint-disable no-await-in-loop -- counting needs one listing running at a time */
async function countEach(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const [name, run] of Object.entries(listings)) counts.set(name, await countQueries(run));
  return counts;
}
/* oxlint-enable no-await-in-loop */

describe("listings do not query once per row", () => {
  // Seeding is the slow part, so every listing is counted against the same two seeds.
  let few = new Map<string, number>();
  let many = new Map<string, number>();
  beforeAll(async () => {
    await seed(3);
    few = await countEach();
    await seed(25);
    many = await countEach();
  });

  for (const name of Object.keys(listings)) {
    test(`${name} uses the same number of queries for 3 rows and for 25`, () => {
      expect(many.get(name)).toBe(few.get(name)!);
    });
  }

  test("a listing shows the photo of the rows that have one, on the origin the request reached", async () => {
    await seed(4);
    const site = "https://site.example.test";
    const news = (await (await app.request(`${site}/api/news?pageSize=50`)).json()) as {
      items: Array<{ asset: string | null; authorPhotoUrl: string }>;
    };
    expect(news.items).toHaveLength(4);
    expect(news.items.every((item) => item.asset?.match(/^(.+)\/api\/assets\/\d+$/)?.[1] === site)).toBe(true);
    expect(news.items.filter((item) => item.authorPhotoUrl.startsWith(`${site}/api/assets/`))).toHaveLength(2);
    expect(news.items.filter((item) => item.authorPhotoUrl === `${site}/api/placeholders/member-photo`)).toHaveLength(
      2,
    );
  });
});

describe("id lists stay under the D1 bound-parameter limit", () => {
  test("queryInChunks splits, dedupes and keeps every row", async () => {
    const ids = [...Array.from({ length: 250 }, (_, i) => i + 1), 1, 2, 3];
    const sizes: number[] = [];
    const rows = await queryInChunks(ids, async (chunk) => {
      sizes.push(chunk.length);
      return chunk;
    });
    expect(sizes).toEqual([90, 90, 70]);
    expect(rows.toSorted((a, b) => a - b)).toEqual(Array.from({ length: 250 }, (_, i) => i + 1));
  });

  test("an unchunked list of 101 ids is refused, as on D1", async () => {
    const ids = Array.from({ length: 101 }, (_, i) => i + 1);
    await expect(db.selectFrom("member").select("id").where("id", "in", ids).execute()).rejects.toThrow(
      /too many SQL variables/,
    );
  });

  test("a photo lookup for 250 members stays under the limit", async () => {
    const members = Array.from({ length: 250 }, (_, i) => ({ memberId: 900000 + i, fullName: `Member ${i}` }));
    const photos = await resolveMemberPhotoViews(members, "en");
    expect(photos.size).toBe(250);
    expect(photos.get(900000)?.photoUrl.endsWith("/api/placeholders/member-photo")).toBe(true);
  });
});
