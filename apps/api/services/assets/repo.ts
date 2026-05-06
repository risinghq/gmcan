import { db } from "../../db/client.js";
import { OWNER_CONFIG } from "./policy.js";
import type { OwnerType } from "./types.js";

export async function ensureOwnerExists(ownerType: OwnerType, ownerId: number): Promise<void> {
  const row = await db.selectFrom(ownerType).select("id").where("id", "=", ownerId).executeTakeFirst();
  if (!row) throw new Error("Owner not found");
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
