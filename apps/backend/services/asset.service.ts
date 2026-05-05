import { createHmac } from "node:crypto";
import path from "node:path";

import type { Context } from "hono";

import { getBackendUrl } from "../config.js";
import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { normalizeAssetKey, saveUploadedFile, serveAsset, sha256Buffer } from "../lib/upload.js";

export type AssetVisibility = "public" | "private";
export type ResourceType = "member" | "news" | "method" | "research_line" | "publication" | "research_group" | "about";

type SlotPolicy = {
  kind: "image" | "brandImage" | "document";
  visibility: AssetVisibility;
};

const RETENTION_DAYS = 90;
const SIGN_SECRET = env.ASSET_SIGNING_SECRET;

const SLOT_POLICIES: Record<string, SlotPolicy> = {
  "member.photo": { kind: "image", visibility: "public" },
  "news.photo": { kind: "image", visibility: "public" },
  "method.photo": { kind: "image", visibility: "public" },
  "research_line.photo": { kind: "image", visibility: "public" },
  "publication.file": { kind: "document", visibility: "public" },
  "research_group.facilities": { kind: "image", visibility: "public" },
  "research_group.header": { kind: "brandImage", visibility: "public" },
  "research_group.footer": { kind: "brandImage", visibility: "public" },
  "about.photo": { kind: "image", visibility: "public" },
};

function nowIso(): string {
  return new Date().toISOString();
}

function plusDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function slotKey(resourceType: ResourceType, slot: string): string {
  return `${resourceType}.${slot}`;
}

function getSlotPolicy(resourceType: ResourceType, slot: string): SlotPolicy {
  const policy = SLOT_POLICIES[slotKey(resourceType, slot)];
  if (!policy) throw new Error(`Unsupported slot '${slot}' for resource '${resourceType}'`);
  return policy;
}

async function ensureResourceExists(resourceType: ResourceType, resourceId: number): Promise<void> {
  const row = await db.selectFrom(resourceType).select("id").where("id", "=", resourceId).executeTakeFirst();
  if (!row) throw new Error("Resource not found");
}

async function writeAudit(
  executor: typeof db,
  action: string,
  assetId: number | null,
  bindingId: number | null,
  actorId: number | null,
): Promise<void> {
  await executor
    .insertInto("asset_audit")
    .values({ action, assetId, bindingId, actorId, createdAt: nowIso(), reason: null })
    .execute();
}

function extensionFromName(fileName: string): string {
  return path.extname(fileName).replace(".", "").toLowerCase();
}

export async function uploadAndReplaceCurrent(input: {
  resourceType: ResourceType;
  resourceId: number;
  slot: string;
  file: File;
  actorId: number | null;
}): Promise<void> {
  await ensureResourceExists(input.resourceType, input.resourceId);
  const policy = getSlotPolicy(input.resourceType, input.slot);

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const storageKey = await saveUploadedFile(input.file, { kind: policy.kind, bytes: buffer });
  if (!storageKey) throw new Error("Invalid file type");

  const ext = extensionFromName(input.file.name);
  const mimeDetected = input.file.type || "application/octet-stream";

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
        visibility: policy.visibility,
        status: "active",
        createdBy: input.actorId,
        createdAt: nowIso(),
        deletedAt: null,
        deleteAfter: null,
      })
      .executeTakeFirst();

    const assetId = Number(assetInsert.insertId);
    const current = await trx
      .selectFrom("asset_binding")
      .select(["id", "assetId"])
      .where("resourceType", "=", input.resourceType)
      .where("resourceId", "=", input.resourceId)
      .where("slot", "=", input.slot)
      .where("isCurrent", "=", 1)
      .where("deletedAt", "is", null)
      .executeTakeFirst();

    const bindingInsert = await trx
      .insertInto("asset_binding")
      .values({
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        slot: input.slot,
        assetId,
        isCurrent: 1,
        replacedByBindingId: null,
        replacedAt: null,
        createdAt: nowIso(),
        deletedAt: null,
      })
      .executeTakeFirst();
    const bindingId = Number(bindingInsert.insertId);

    if (current) {
      await trx
        .updateTable("asset_binding")
        .set({ isCurrent: 0, replacedByBindingId: bindingId, replacedAt: nowIso() })
        .where("id", "=", current.id)
        .execute();

      await trx
        .updateTable("asset")
        .set({ status: "soft_deleted", deletedAt: nowIso(), deleteAfter: plusDays(RETENTION_DAYS) })
        .where("id", "=", current.assetId)
        .execute();
    }

    await writeAudit(trx as typeof db, "upload", assetId, bindingId, input.actorId);
    if (current) await writeAudit(trx as typeof db, "replace", current.assetId, current.id, input.actorId);
  });
}

export async function softDeleteCurrentBinding(input: {
  resourceType: ResourceType;
  resourceId: number;
  slot: string;
  actorId: number | null;
}): Promise<void> {
  const current = await db
    .selectFrom("asset_binding")
    .select(["id", "assetId"])
    .where("resourceType", "=", input.resourceType)
    .where("resourceId", "=", input.resourceId)
    .where("slot", "=", input.slot)
    .where("isCurrent", "=", 1)
    .where("deletedAt", "is", null)
    .executeTakeFirst();
  if (!current) throw new Error("Current asset binding not found");

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("asset_binding")
      .set({ isCurrent: 0, deletedAt: nowIso(), replacedAt: nowIso() })
      .where("id", "=", current.id)
      .execute();
    await trx
      .updateTable("asset")
      .set({ status: "soft_deleted", deletedAt: nowIso(), deleteAfter: plusDays(RETENTION_DAYS) })
      .where("id", "=", current.assetId)
      .execute();
    await writeAudit(trx as typeof db, "soft_delete", current.assetId, current.id, input.actorId);
  });
}

export async function restoreBinding(bindingId: number, actorId: number | null): Promise<void> {
  const binding = await db.selectFrom("asset_binding").selectAll().where("id", "=", bindingId).executeTakeFirst();
  if (!binding) throw new Error("Binding not found");

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("asset_binding")
      .set({ isCurrent: 0, replacedAt: nowIso() })
      .where("resourceType", "=", binding.resourceType)
      .where("resourceId", "=", binding.resourceId)
      .where("slot", "=", binding.slot)
      .where("isCurrent", "=", 1)
      .where("deletedAt", "is", null)
      .execute();

    await trx
      .updateTable("asset_binding")
      .set({ isCurrent: 1, deletedAt: null })
      .where("id", "=", binding.id)
      .execute();

    await trx
      .updateTable("asset")
      .set({ status: "active", deletedAt: null, deleteAfter: null })
      .where("id", "=", binding.assetId)
      .execute();
    await writeAudit(trx as typeof db, "restore", binding.assetId, binding.id, actorId);
  });
}

function signAccess(assetId: number, expiresAt: number): string {
  return createHmac("sha256", SIGN_SECRET).update(`${assetId}:${expiresAt}`).digest("hex");
}

export function makeSignedAssetUrl(assetId: number, expiresInSeconds: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const token = signAccess(assetId, expiresAt);
  return `${getBackendUrl()}/api/assets/${assetId}?expires=${expiresAt}&token=${token}`;
}

export async function resolveAssetAccessUrl(input: {
  resourceType: ResourceType;
  resourceId: number;
  slot: string;
}): Promise<string | null> {
  const row = await db
    .selectFrom("asset_binding as b")
    .innerJoin("asset as a", "a.id", "b.assetId")
    .select(["a.id", "a.visibility"])
    .where("b.resourceType", "=", input.resourceType)
    .where("b.resourceId", "=", input.resourceId)
    .where("b.slot", "=", input.slot)
    .where("b.isCurrent", "=", 1)
    .where("b.deletedAt", "is", null)
    .where("a.status", "=", "active")
    .executeTakeFirst();
  if (!row) return null;
  return row.visibility === "private" ? makeSignedAssetUrl(row.id, 300) : `${getBackendUrl()}/api/assets/${row.id}`;
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
    .where("status", "=", "active")
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
