import { beforeEach, expect, test } from "bun:test";

import { db } from "../db/client.js";
import { deleteCurrentAsset, restoreAsset } from "../services/assets/service.js";
import { createNews } from "../services/news.service.js";

let newsId = 0;
let assetId = 0;

beforeEach(async () => {
  await db.deleteFrom("news").execute();
  await db.deleteFrom("asset").execute();
  await db.deleteFrom("member").execute();

  const member = await db
    .insertInto("member")
    .values({
      dni: "30000001",
      email: "owner@example.test",
      passwordHash: "x",
      firstName: "Owner",
      lastName: "Test",
      maternalName: null,
      birthDate: null,
      isActive: 1,
      passwordResetRequired: 0,
      roleCode: "researcher",
      memberTypeCode: "researcher",
      prefixCode: null,
      genderCode: null,
      resetToken: null,
      resetExpiresAt: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    })
    .executeTakeFirstOrThrow();
  newsId = await createNews({
    statusCode: "published",
    authorId: Number(member.insertId),
    newsKindCode: "general",
    translations: { es: { title: "t", summary: "s", body: "b" }, en: { title: "t", summary: "s", body: "b" } },
  });

  const asset = await db
    .insertInto("asset")
    .values({
      storageKey: "test/photo.png",
      bucket: "local",
      mimeDetected: "image/png",
      ext: "png",
      sizeBytes: 1,
      sha256: "0",
      visibility: "public",
      lifecycleStatus: "active",
      createdBy: null,
      createdAt: "2026-01-01",
      deletedAt: null,
    })
    .executeTakeFirstOrThrow();
  assetId = Number(asset.insertId);
  await db
    .insertInto("news_asset")
    .values({ newsId, slot: "photo", version: 1, assetId, actorId: null, reason: "upload", createdAt: "2026-01-01" })
    .execute();
});

async function assetRow() {
  return db.selectFrom("asset").selectAll().where("id", "=", assetId).executeTakeFirstOrThrow();
}

test("a soft delete records when it happened and stores no purge date", async () => {
  await deleteCurrentAsset({ ownerType: "news", ownerId: newsId, slot: "photo", actorId: null });
  const row = await assetRow();
  expect(row.lifecycleStatus).toBe("soft_deleted");
  expect(row.deletedAt).not.toBeNull();
  expect(row).not.toHaveProperty("deleteAfter");
});

test("restoring clears the deletion time", async () => {
  await deleteCurrentAsset({ ownerType: "news", ownerId: newsId, slot: "photo", actorId: null });
  await restoreAsset(assetId, null);
  const row = await assetRow();
  expect(row.lifecycleStatus).toBe("active");
  expect(row.deletedAt).toBeNull();
});

test("the database accepts only the active and soft_deleted states", async () => {
  const updates = ["hard_deleted", "quarantined"].map((lifecycleStatus) =>
    db
      .updateTable("asset")
      .set({ lifecycleStatus: lifecycleStatus as never })
      .where("id", "=", assetId)
      .execute(),
  );
  const results = await Promise.allSettled(updates);
  expect(results.map((result) => result.status)).toEqual(["rejected", "rejected"]);
  expect((await assetRow()).lifecycleStatus).toBe("active");
});
