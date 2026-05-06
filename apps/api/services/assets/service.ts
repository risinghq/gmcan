import { createHmac } from "node:crypto";

import type { Context } from "hono";

import { getBackendUrl } from "../../config.js";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { normalizeAssetKey, saveUploadedFile, serveAsset, sha256Buffer } from "../../lib/upload.js";
import { OWNER_CONFIG } from "./policy.js";
import { ensureOwnerExists, getCurrentAssetId, getNextVersion } from "./repo.js";
import type { AssetDeleteRequest, AssetWriteRequest, OwnerType } from "./types.js";
import { assertSlotForOwner } from "./validators.js";

const RETENTION_DAYS = 90;
const SIGN_SECRET = env.ASSET_SIGNING_SECRET;

function nowIso(): string {
  return new Date().toISOString();
}

function plusDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function extensionFromName(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

export async function putAsset(input: AssetWriteRequest): Promise<void> {
  assertSlotForOwner(input.ownerType, input.slot);
  await ensureOwnerExists(input.ownerType, input.ownerId);

  const cfg = OWNER_CONFIG[input.ownerType];
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const storageKey = await saveUploadedFile(input.file, {
    kind: cfg.kindBySlot[input.slot],
    bytes: buffer,
  });
  if (!storageKey) throw new Error("Invalid file type");

  const ext = extensionFromName(input.file.name);
  const mimeDetected = input.file.type || "application/octet-stream";
  const previousAssetId = await getCurrentAssetId(input.ownerType, input.ownerId, input.slot);
  const version = await getNextVersion(input.ownerType, input.ownerId, input.slot);

  await db.transaction().execute(async (trx) => {
    const assetInsert = await trx
      .insertInto("asset")
      .values({
        storageKey,
        bucket: "local",
        mimeDetected,
        ext,
        sizeBytes: buffer.byteLength,
        sha256: sha256Buffer(buffer),
        visibility: "public",
        lifecycleStatus: "active",
        createdBy: input.actorId,
        createdAt: nowIso(),
        deletedAt: null,
        deleteAfter: null,
      })
      .executeTakeFirstOrThrow();

    const assetId = Number(assetInsert.insertId);

    await trx
      .insertInto(cfg.table)
      .values({
        [cfg.ownerColumn]: input.ownerId,
        slot: input.slot,
        version,
        assetId,
        actorId: input.actorId,
        reason: "upload",
        createdAt: nowIso(),
      } as never)
      .execute();

    if (previousAssetId) {
      await trx
        .updateTable("asset")
        .set({ lifecycleStatus: "soft_deleted", deletedAt: nowIso(), deleteAfter: plusDays(RETENTION_DAYS) })
        .where("id", "=", previousAssetId)
        .execute();
      await trx
        .insertInto("asset_audit")
        .values({
          action: "replace",
          assetId: previousAssetId,
          actorId: input.actorId,
          reason: null,
          createdAt: nowIso(),
        })
        .execute();
    }

    await trx
      .insertInto("asset_audit")
      .values({ action: "upload", assetId, actorId: input.actorId, reason: null, createdAt: nowIso() })
      .execute();
  });
}

export async function deleteCurrentAsset(input: AssetDeleteRequest): Promise<void> {
  assertSlotForOwner(input.ownerType, input.slot);
  const assetId = await getCurrentAssetId(input.ownerType, input.ownerId, input.slot);
  if (!assetId) throw new Error("Current asset binding not found");

  await db
    .updateTable("asset")
    .set({ lifecycleStatus: "soft_deleted", deletedAt: nowIso(), deleteAfter: plusDays(RETENTION_DAYS) })
    .where("id", "=", assetId)
    .execute();

  await db
    .insertInto("asset_audit")
    .values({ action: "soft_delete", assetId, actorId: input.actorId, reason: null, createdAt: nowIso() })
    .execute();
}

export async function restoreAsset(assetId: number, actorId: number | null): Promise<void> {
  const row = await db.selectFrom("asset").select("id").where("id", "=", assetId).executeTakeFirst();
  if (!row) throw new Error("Asset not found");

  await db
    .updateTable("asset")
    .set({ lifecycleStatus: "active", deletedAt: null, deleteAfter: null })
    .where("id", "=", assetId)
    .execute();

  await db
    .insertInto("asset_audit")
    .values({ action: "restore", assetId, actorId, reason: null, createdAt: nowIso() })
    .execute();
}

function signAccess(assetId: number, expiresAt: number): string {
  return createHmac("sha256", SIGN_SECRET).update(`${assetId}:${expiresAt}`).digest("hex");
}

function makeSignedAssetUrl(assetId: number, expiresInSeconds: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const token = signAccess(assetId, expiresAt);
  return `${getBackendUrl()}/api/assets/${assetId}?expires=${expiresAt}&token=${token}`;
}

export async function resolveAssetAccessUrl(input: {
  ownerType: OwnerType;
  ownerId: number;
  slot: string;
}): Promise<string | null> {
  assertSlotForOwner(input.ownerType, input.slot);
  const cfg = OWNER_CONFIG[input.ownerType];

  const row = await db
    .selectFrom(cfg.table)
    .innerJoin("asset", "asset.id", `${cfg.table}.assetId` as never)
    .select([`${cfg.table}.assetId` as never, "asset.visibility", "asset.lifecycleStatus"])
    .where(cfg.ownerColumn, "=", input.ownerId as never)
    .where("slot", "=", input.slot as never)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();

  if (!row || row.lifecycleStatus !== "active") return null;
  const assetId = row.assetId as number;
  return row.visibility === "private" ? makeSignedAssetUrl(assetId, 300) : `${getBackendUrl()}/api/assets/${assetId}`;
}

export async function serveAssetById(
  c: Context,
  assetId: number,
  options: { download?: boolean; token?: string; expires?: number },
): Promise<Response> {
  const row = await db
    .selectFrom("asset")
    .selectAll()
    .where("id", "=", assetId)
    .where("lifecycleStatus", "=", "active")
    .executeTakeFirst();
  if (!row) return c.json({ error: "File not found" }, 404);

  if (row.visibility === "private") {
    if (!options.token || !options.expires) return c.json({ error: "Unauthorized" }, 401);
    if (options.expires < Math.floor(Date.now() / 1000)) return c.json({ error: "Token expired" }, 401);
    if (signAccess(assetId, options.expires) !== options.token) return c.json({ error: "Invalid token" }, 401);
  }

  const key = normalizeAssetKey(row.storageKey);
  if (!key) return c.json({ error: "Invalid asset key" }, 400);
  return serveAsset(c, { assetKey: key, asAttachment: options.download });
}
