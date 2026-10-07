import { createHmac } from "node:crypto";

import type { Context } from "hono";
import type { Compilable } from "kysely";

import { getBackendUrl } from "../../config.js";
import { env } from "../../config/env.js";
import { atomic, db, lastInsertId } from "../../db/client.js";
import { normalizeAssetKey, saveUploadedFile, serveAsset, sha256Buffer } from "../../lib/upload.js";
import { OWNER_CONFIG } from "./policy.js";
import { type ActiveAsset, ensureOwnerExists, getActiveAssets, getCurrentAssetId, getNextVersion } from "./repo.js";
import type { AssetDeleteRequest, AssetLinks, AssetWriteRequest, OwnerType } from "./types.js";
import { assertSlotForOwner } from "./validators.js";

const SIGN_SECRET = env.ASSET_SIGNING_SECRET;

function nowIso(): string {
  return new Date().toISOString();
}

function extensionFromName(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

export async function putAsset(input: AssetWriteRequest): Promise<void> {
  assertSlotForOwner(input.ownerType, input.slot);
  await ensureOwnerExists(input.ownerType, input.ownerId);

  const cfg = OWNER_CONFIG[input.ownerType];
  const buffer = new Uint8Array(await input.file.arrayBuffer());
  const storageKey = await saveUploadedFile(input.file, {
    kind: cfg.kindBySlot[input.slot],
    bytes: buffer,
  });
  if (!storageKey) throw new Error("Invalid file type");

  const ext = extensionFromName(input.file.name);
  const mimeDetected = input.file.type || "application/octet-stream";
  const previousAssetId = await getCurrentAssetId(input.ownerType, input.ownerId, input.slot);
  const version = await getNextVersion(input.ownerType, input.ownerId, input.slot);

  const queries: Compilable[] = [
    db.insertInto("asset").values({
      storageKey,
      bucket: "r2",
      mimeDetected,
      ext,
      sizeBytes: buffer.byteLength,
      sha256: sha256Buffer(buffer),
      visibility: "public",
      lifecycleStatus: "active",
      createdBy: input.actorId,
      createdAt: nowIso(),
      deletedAt: null,
    }),
    db.insertInto(cfg.table).values({
      [cfg.ownerColumn]: input.ownerId,
      slot: input.slot,
      version,
      assetId: lastInsertId("asset"),
      actorId: input.actorId,
      reason: "upload",
      createdAt: nowIso(),
    } as never),
  ];

  if (previousAssetId) {
    queries.push(
      db
        .updateTable("asset")
        .set({ lifecycleStatus: "soft_deleted", deletedAt: nowIso() })
        .where("id", "=", previousAssetId),
      db.insertInto("asset_audit").values({
        action: "replace",
        assetId: previousAssetId,
        actorId: input.actorId,
        reason: null,
        createdAt: nowIso(),
      }),
    );
  }

  // The new asset stays the newest asset row, so lastInsertId still names it after the earlier statements.
  queries.push(
    db.insertInto("asset_audit").values({
      action: "upload",
      assetId: lastInsertId("asset"),
      actorId: input.actorId,
      reason: null,
      createdAt: nowIso(),
    }),
  );
  await atomic(queries);
}

export async function deleteCurrentAsset(input: AssetDeleteRequest): Promise<void> {
  assertSlotForOwner(input.ownerType, input.slot);
  const assetId = await getCurrentAssetId(input.ownerType, input.ownerId, input.slot);
  if (!assetId) throw new Error("Current asset binding not found");

  await db
    .updateTable("asset")
    .set({ lifecycleStatus: "soft_deleted", deletedAt: nowIso() })
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

  await db.updateTable("asset").set({ lifecycleStatus: "active", deletedAt: null }).where("id", "=", assetId).execute();

  await db
    .insertInto("asset_audit")
    .values({ action: "restore", assetId, actorId, reason: null, createdAt: nowIso() })
    .execute();
}

function signAccess(assetId: number, expiresAt: number): string {
  return createHmac("sha256", SIGN_SECRET).update(`${assetId}:${expiresAt}`).digest("hex");
}

function makeAssetPath(assetId: number, asAttachment: boolean): string {
  return asAttachment ? `/api/assets/${assetId}/download` : `/api/assets/${assetId}`;
}

function makeSignedAssetUrl(assetId: number, expiresInSeconds: number, asAttachment: boolean): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const token = signAccess(assetId, expiresAt);
  return `${getBackendUrl()}${makeAssetPath(assetId, asAttachment)}?expires=${expiresAt}&token=${token}`;
}

function makePublicAssetUrl(assetId: number, asAttachment: boolean): string {
  return `${getBackendUrl()}${makeAssetPath(assetId, asAttachment)}`;
}

function accessUrl(asset: ActiveAsset | undefined): string | null {
  if (!asset) return null;
  return asset.visibility === "private"
    ? makeSignedAssetUrl(asset.id, 300, false)
    : makePublicAssetUrl(asset.id, false);
}

function accessLinks(asset: ActiveAsset | undefined): AssetLinks | null {
  if (!asset) return null;
  const isPrivate = asset.visibility === "private";
  return {
    inline: isPrivate ? makeSignedAssetUrl(asset.id, 300, false) : makePublicAssetUrl(asset.id, false),
    download: isPrivate ? makeSignedAssetUrl(asset.id, 300, true) : makePublicAssetUrl(asset.id, true),
  };
}

export async function resolveAssetAccessUrl(input: {
  ownerType: OwnerType;
  ownerId: number;
  slot: string;
}): Promise<string | null> {
  assertSlotForOwner(input.ownerType, input.slot);
  return accessUrl((await getActiveAssets(input.ownerType, [input.ownerId], input.slot)).get(input.ownerId));
}

export async function resolveAssetAccessLinks(input: {
  ownerType: OwnerType;
  ownerId: number;
  slot: string;
}): Promise<AssetLinks | null> {
  assertSlotForOwner(input.ownerType, input.slot);
  return accessLinks((await getActiveAssets(input.ownerType, [input.ownerId], input.slot)).get(input.ownerId));
}

/** Resolves the slot of many owners with one query per 90 owners. Every requested owner has an entry. */
export async function resolveAssetAccessUrls(input: {
  ownerType: OwnerType;
  ownerIds: number[];
  slot: string;
}): Promise<Map<number, string | null>> {
  assertSlotForOwner(input.ownerType, input.slot);
  const assets = await getActiveAssets(input.ownerType, input.ownerIds, input.slot);
  return new Map(input.ownerIds.map((id) => [id, accessUrl(assets.get(id))]));
}

/** Like `resolveAssetAccessUrls`, with the inline and download links of each file. */
export async function resolveAssetAccessLinkMap(input: {
  ownerType: OwnerType;
  ownerIds: number[];
  slot: string;
}): Promise<Map<number, AssetLinks | null>> {
  assertSlotForOwner(input.ownerType, input.slot);
  const assets = await getActiveAssets(input.ownerType, input.ownerIds, input.slot);
  return new Map(input.ownerIds.map((id) => [id, accessLinks(assets.get(id))]));
}

export async function serveAssetById(
  c: Context,
  assetId: number,
  options: { asAttachment: boolean; token?: string; expires?: number },
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
  return serveAsset(c, { assetKey: key, asAttachment: options.asAttachment, private: row.visibility === "private" });
}
