import fs from "node:fs";
import path from "node:path";

import { db } from "../client.js";
import { STORAGE_ROOT, assetExists, buildAssetKey, normalizeAssetKey, quarantineAsset, sha256Buffer } from "../../lib/upload.js";

const SEED_SOURCE_ROOT = path.resolve(process.cwd(), "assets/seed-src");
const MAP_FILE = path.join(STORAGE_ROOT, ".seed-import-map.json");

const ASSET_COLUMNS: Array<{ table: string; column: string }> = [
  { table: "member", column: "photo" },
  { table: "news", column: "photo" },
  { table: "method", column: "photo" },
  { table: "research_line", column: "photo" },
  { table: "publication", column: "file" },
  { table: "research_group", column: "logoHeader" },
  { table: "research_group", column: "logoFooter" },
  { table: "research_group", column: "facilitiesPhoto" },
  { table: "about", column: "photo" },
];

type MapJson = { bySource: Record<string, string>; byHash: Record<string, string> };

function readMap(): MapJson {
  if (!fs.existsSync(MAP_FILE)) return { bySource: {}, byHash: {} };
  return JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) as MapJson;
}

function writeMap(map: MapJson): void {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
}

function resolveLegacySeedPath(key: string): string | null {
  const normalized = key.replace(/^seed\//, "").replace(/^seed-src\//, "");
  const candidate = path.resolve(SEED_SOURCE_ROOT, normalized);
  const relative = path.relative(SEED_SOURCE_ROOT, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(candidate)) return null;
  return candidate;
}

function importSourceAsset(sourceKey: string, map: MapJson): string | null {
  if (map.bySource[sourceKey]) return map.bySource[sourceKey];
  const filePath = resolveLegacySeedPath(sourceKey);
  if (!filePath) return null;

  const data = fs.readFileSync(filePath);
  const hash = sha256Buffer(data);
  const existing = map.byHash[hash];
  if (existing && assetExists(existing)) {
    map.bySource[sourceKey] = existing;
    return existing;
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const key = buildAssetKey(ext);
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  fs.writeFileSync(path.join(STORAGE_ROOT, key), data);
  map.bySource[sourceKey] = key;
  map.byHash[hash] = key;
  return key;
}

export async function importSeedAssetsAndRewriteReferences() {
  const map = readMap();
  for (const { table, column } of ASSET_COLUMNS) {
    const rows = await db.selectFrom(table as never).select(["id", column] as never).execute();
    for (const row of rows as Array<{ id: number; [k: string]: string | null }>) {
      const value = row[column];
      if (!value) continue;

      const normalizedRuntime = normalizeAssetKey(value);
      if (normalizedRuntime && assetExists(normalizedRuntime)) continue;

      const imported = importSourceAsset(value, map);
      if (!imported || imported === value) continue;
      await db
        .updateTable(table as never)
        .set({ [column]: imported } as never)
        .where("id", "=", row.id)
        .execute();
    }
  }
  writeMap(map);
}

export async function auditAndQuarantineOrphans() {
  const referenced = new Set<string>();
  for (const { table, column } of ASSET_COLUMNS) {
    const rows = await db.selectFrom(table as never).select(column as never).where(column as never, "is not", null).execute();
    for (const row of rows as Array<Record<string, string>>) {
      const key = normalizeAssetKey(row[column]);
      if (key) referenced.add(key);
    }
  }

  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  const files = fs
    .readdirSync(STORAGE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."));

  const missingReferenced: string[] = [];
  for (const key of referenced) {
    if (!assetExists(key)) missingReferenced.push(key);
  }

  const moved: string[] = [];
  for (const file of files) {
    if (referenced.has(file)) continue;
    const ok = await quarantineAsset({ assetKey: file, reason: "orphan-audit" });
    if (ok) moved.push(file);
  }

  return { missingReferenced, moved };
}
