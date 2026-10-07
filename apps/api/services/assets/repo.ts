import { sql } from "kysely";

import { db, queryInChunks } from "../../db/client.js";
import { notFound } from "../../lib/errors/app-error.js";
import { OWNER_CONFIG } from "./policy.js";
import type { OwnerType } from "./types.js";

export async function ensureOwnerExists(ownerType: OwnerType, ownerId: number): Promise<void> {
  const row = await db.selectFrom(ownerType).select("id").where("id", "=", ownerId).executeTakeFirst();
  if (!row) throw notFound("Owner not found");
}

export async function getCurrentAssetId(ownerType: OwnerType, ownerId: number, slot: string): Promise<number | null> {
  const cfg = OWNER_CONFIG[ownerType];
  const row = await db
    .selectFrom(cfg.table)
    .select("assetId")
    .where(cfg.ownerColumn, "=", ownerId as never)
    .where("slot", "=", slot as never)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();
  return row?.assetId ?? null;
}

export type ActiveAsset = { id: number; visibility: string };

/**
 * The newest binding of each owner for the slot, with its asset, in one query per 90 owners. Owners
 * without a binding, or whose newest asset is not active, are absent from the map.
 */
export async function getActiveAssets(
  ownerType: OwnerType,
  ownerIds: number[],
  slot: string,
): Promise<Map<number, ActiveAsset>> {
  const cfg = OWNER_CONFIG[ownerType];
  const owner = sql.ref(`binding.${cfg.ownerColumn}`);

  const rows = await queryInChunks(ownerIds, async (chunk) => {
    const result = await sql<{ ownerId: number; id: number; visibility: string; lifecycleStatus: string }>`
      select ${owner} as ownerId, asset.id as id, asset.visibility as visibility,
             asset.lifecycleStatus as lifecycleStatus
      from ${sql.table(cfg.table)} as binding
      join asset on asset.id = binding.assetId
      where ${owner} in (${sql.join(chunk)}) and binding.slot = ${slot}
        and binding.version = (
          select max(newest.version) from ${sql.table(cfg.table)} as newest
          where newest.${sql.ref(cfg.ownerColumn)} = ${owner} and newest.slot = binding.slot)`.execute(db);
    return result.rows;
  });

  const assets = new Map<number, ActiveAsset>();
  for (const row of rows) {
    if (row.lifecycleStatus === "active") assets.set(row.ownerId, { id: row.id, visibility: row.visibility });
  }
  return assets;
}

export async function getNextVersion(ownerType: OwnerType, ownerId: number, slot: string): Promise<number> {
  const cfg = OWNER_CONFIG[ownerType];
  const row = await db
    .selectFrom(cfg.table)
    .select(({ fn }) => fn.max<number>("version").as("maxVersion"))
    .where(cfg.ownerColumn, "=", ownerId as never)
    .where("slot", "=", slot as never)
    .executeTakeFirst();
  return (row?.maxVersion ?? 0) + 1;
}
