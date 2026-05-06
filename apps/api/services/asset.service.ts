import { createHmac } from "node:crypto";

import type { Context } from "hono";

import { getBackendUrl } from "../config.js";
import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { normalizeAssetKey, saveUploadedFile, serveAsset, sha256Buffer } from "../lib/upload.js";

export type AssetVisibility = "public" | "private";
export type ResourceType = "member" | "news" | "method" | "research_line" | "publication" | "research_group" | "about";

const RETENTION_DAYS = 90;
const SIGN_SECRET = env.ASSET_SIGNING_SECRET;

type OwnerConfig = {
  table:
    | "member_asset"
    | "news_asset"
    | "method_asset"
    | "research_line_asset"
    | "publication_asset"
    | "research_group_asset"
    | "about_asset";
  ownerColumn: "memberId" | "newsId" | "methodId" | "researchLineId" | "publicationId" | "groupId" | "aboutId";
  resourceTable: ResourceType;
  slots: readonly string[];
  kindBySlot: Record<string, "image" | "brandImage" | "document">;
};

const OWNER_CONFIG: Record<ResourceType, OwnerConfig> = {
  member: {
    table: "member_asset",
    ownerColumn: "memberId",
    resourceTable: "member",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  news: {
    table: "news_asset",
    ownerColumn: "newsId",
    resourceTable: "news",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  method: {
    table: "method_asset",
    ownerColumn: "methodId",
    resourceTable: "method",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  research_line: {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    resourceTable: "research_line",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
  publication: {
    table: "publication_asset",
    ownerColumn: "publicationId",
    resourceTable: "publication",
    slots: ["file"],
    kindBySlot: { file: "document" },
  },
  research_group: {
    table: "research_group_asset",
    ownerColumn: "groupId",
    resourceTable: "research_group",
    slots: ["facilities", "header", "footer"],
    kindBySlot: { facilities: "image", header: "brandImage", footer: "brandImage" },
  },
  about: {
    table: "about_asset",
    ownerColumn: "aboutId",
    resourceTable: "about",
    slots: ["photo"],
    kindBySlot: { photo: "image" },
  },
};

function nowIso(): string {
  return new Date().toISOString();
}

function plusDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function assertSlot(ownerType: ResourceType, slot: string) {
  const config = OWNER_CONFIG[resourceType];
  if (!config.slots.includes(slot)) throw new Error(`Unsupported slot '${slot}' for resource '${resourceType}'`);
  return config;
}

async function ensureResourceExists(ownerType: ResourceType, ownerId: number): Promise<void> {
  const row = await db.selectFrom(resourceType).select("id").where("id", "=", resourceId).executeTakeFirst();
  if (!row) throw new Error("Resource not found");
}

async function writeAudit(action: string, assetId: number | null, actorId: number | null, reason: string | null) {
  await db.insertInto("asset_audit").values({ action, assetId, actorId, reason, createdAt: nowIso() }).execute();
}

function extensionFromName(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

async function latestVersion(ownerType: ResourceType, ownerId: number, slot: string): Promise<number> {
  const config = OWNER_CONFIG[resourceType];
  const row = await db
    .selectFrom(config.table)
    .select(({ fn }) => fn.max<number>("version").as("maxVersion"))
    .where(config.ownerColumn, "=", resourceId as never)
    .where("slot", "=", slot as never)
    .executeTakeFirst();

  return row?.maxVersion ?? 0;
}

async function currentAssetId(ownerType: ResourceType, ownerId: number, slot: string): Promise<number | null> {
  const config = OWNER_CONFIG[resourceType];
  const row = await db
    .selectFrom(config.table)
    .select("assetId")
    .where(config.ownerColumn, "=", resourceId as never)
    .where("slot", "=", slot as never)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();
  return row?.assetId ?? null;
}

export async function uploadAndReplaceCurrent(input: {
  ownerType: ResourceType;
  ownerId: number;
  slot: string;
  file: File;
  actorId: number | null;
}): Promise<void> {
  const config = assertSlot(input.resourceType, input.slot);
  await ensureResourceExists(input.resourceType, input.resourceId);

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const storageKey = await saveUploadedFile(input.file, {
    kind: config.kindBySlot[input.slot],
    bytes: buffer,
  });
  if (!storageKey) throw new Error("Invalid file type");

  const ext = extensionFromName(input.file.name);
  const mimeDetected = input.file.type || "application/octet-stream";

  const previousAssetId = await currentAssetId(input.resourceType, input.resourceId, input.slot);
  const version = (await latestVersion(input.resourceType, input.resourceId, input.slot)) + 1;

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
      .insertInto(config.table)
      .values({
        [config.ownerColumn]: input.resourceId,
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

export async function softDeleteCurrentBinding(input: {
  ownerType: ResourceType;
  ownerId: number;
  slot: string;
  actorId: number | null;
}): Promise<void> {
  assertSlot(input.resourceType, input.slot);
  const assetId = await currentAssetId(input.resourceType, input.resourceId, input.slot);
  if (!assetId) throw new Error("Current asset binding not found");

  await db
    .updateTable("asset")
    .set({ lifecycleStatus: "soft_deleted", deletedAt: nowIso(), deleteAfter: plusDays(RETENTION_DAYS) })
    .where("id", "=", assetId)
    .execute();

  await writeAudit("soft_delete", assetId, input.actorId, null);
}

export async function restoreBinding(assetId: number, actorId: number | null): Promise<void> {
  const row = await db.selectFrom("asset").select(["id"]).where("id", "=", assetId).executeTakeFirst();
  if (!row) throw new Error("Binding not found");

  await db
    .updateTable("asset")
    .set({ lifecycleStatus: "active", deletedAt: null, deleteAfter: null })
    .where("id", "=", assetId)
    .execute();
  await writeAudit("restore", assetId, actorId, null);
}

function signAccess(assetId: number, expiresAt: number): string {
  return createHmac("sha256", SIGN_SECRET).update(`${assetId}:${expiresAt}`).digest("hex");
}

export function makeSignedAssetUrl(assetId: number, expiresInSeconds: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const token = signAccess(assetId, expiresAt);
  return `${getBackendUrl()}/api/assets/${assetId}?expires=${expiresAt}&token=${token}`;
}

async function resolveAssetIdByOwner(ownerType: ResourceType, ownerId: number, slot: string): Promise<number | null> {
  assertSlot(resourceType, slot);
  const config = OWNER_CONFIG[resourceType];
  const row = await db
    .selectFrom(config.table)
    .innerJoin("asset", "asset.id", `${config.table}.assetId` as never)
    .select([`${config.table}.assetId` as never, "asset.visibility", "asset.lifecycleStatus"])
    .where(config.ownerColumn, "=", resourceId as never)
    .where("slot", "=", slot as never)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();

  if (!row || row.lifecycleStatus !== "active") return null;
  return row.assetId as number;
}

export async function resolveAssetAccessUrl(input: {
  ownerType: ResourceType;
  ownerId: number;
  slot: string;
}): Promise<string | null> {
  const assetId = await resolveAssetIdByOwner(input.resourceType, input.resourceId, input.slot);
  if (!assetId) return null;

  const asset = await db.selectFrom("asset").select(["visibility"]).where("id", "=", assetId).executeTakeFirst();
  if (!asset) return null;
  return asset.visibility === "private" ? makeSignedAssetUrl(assetId, 300) : `${getBackendUrl()}/api/assets/${assetId}`;
}

export const resolveAssetAccessUrlByOwner = {
  member: (memberId: number, slot: "photo") => resolveAssetAccessUrl({ ownerType: "member", ownerId: memberId, slot }),
  news: (newsId: number, slot: "photo") => resolveAssetAccessUrl({ ownerType: "news", ownerId: newsId, slot }),
  method: (methodId: number, slot: "photo") => resolveAssetAccessUrl({ ownerType: "method", ownerId: methodId, slot }),
  researchLine: (researchLineId: number, slot: "photo") =>
    resolveAssetAccessUrl({ ownerType: "research_line", ownerId: researchLineId, slot }),
  publication: (publicationId: number, slot: "file") =>
    resolveAssetAccessUrl({ ownerType: "publication", ownerId: publicationId, slot }),
  researchGroup: (groupId: number, slot: "facilities" | "header" | "footer") =>
    resolveAssetAccessUrl({ ownerType: "research_group", ownerId: groupId, slot }),
  about: (aboutId: number, slot: "photo") => resolveAssetAccessUrl({ ownerType: "about", ownerId: aboutId, slot }),
};

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
