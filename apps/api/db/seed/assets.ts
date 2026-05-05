import fs from "node:fs";
import path from "node:path";

import { STORAGE_ROOT, assetExists, buildAssetKey, quarantineAsset, sha256Buffer } from "../../lib/upload.js";
import { db } from "../client.js";

const SEED_SOURCE_ROOT = path.resolve(process.cwd(), "assets/seed-src");
const MAP_FILE = path.join(STORAGE_ROOT, ".seed-import-map.json");

type SeedBinding = {
  resourceType: "member" | "news" | "method" | "research_line" | "publication" | "research_group" | "about";
  slot: string;
  source: string;
  resourceId?: number;
  memberDni?: string;
};

const SEED_BINDINGS: SeedBinding[] = [
  { resourceType: "member", memberDni: "06766048", slot: "photo", source: "seed/members/justo.jpg" },
  { resourceType: "member", memberDni: "09934476", slot: "photo", source: "seed/members/chachi.png" },
  { resourceType: "member", memberDni: "71752895", slot: "photo", source: "seed/members/renzo-vizarreta.jpg" },
  { resourceType: "member", memberDni: "71774958", slot: "photo", source: "seed/members/renzo-velasquez.jpg" },
  { resourceType: "news", resourceId: 56, slot: "photo", source: "seed/news/news-56.jpg" },
  {
    resourceType: "research_line",
    resourceId: 1,
    slot: "photo",
    source: "seed/research-lines/structural-nanoparticles.jpg",
  },
  {
    resourceType: "research_line",
    resourceId: 2,
    slot: "photo",
    source: "seed/research-lines/hexagonal-nanosystems.jpg",
  },
  { resourceType: "research_line", resourceId: 3, slot: "photo", source: "seed/research-lines/nanomagnetism.jpg" },
  { resourceType: "method", resourceId: 3, slot: "photo", source: "seed/methods/monte-carlo.jpeg" },
  { resourceType: "method", resourceId: 4, slot: "photo", source: "seed/methods/spin-dynamics.jpg" },
  {
    resourceType: "publication",
    resourceId: 2,
    slot: "file",
    source: "seed/publications/GymxaQPxRqoXvImvfZcKWAfw.pdf",
  },
  {
    resourceType: "publication",
    resourceId: 3,
    slot: "file",
    source: "seed/publications/N3eSqMJvE1F0HWXspbEfplB6.pdf",
  },
  { resourceType: "research_group", resourceId: 1, slot: "facilities", source: "seed/group/facilities.jpg" },
  { resourceType: "research_group", resourceId: 1, slot: "header", source: "seed/group/header.png" },
  { resourceType: "research_group", resourceId: 1, slot: "footer", source: "seed/group/footer.png" },
];

type MapJson = { bySource: Record<string, string>; byHash: Record<string, string> };
const SEED_CONCURRENCY = 8;

function readMap(): MapJson {
  if (!fs.existsSync(MAP_FILE)) return { bySource: {}, byHash: {} };
  return JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) as MapJson;
}

function writeMap(map: MapJson): void {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
}

function resolveSeedPath(source: string): string {
  const normalized = source.replace(/^seed\//, "").replace(/^seed-src\//, "");
  const candidate = path.resolve(SEED_SOURCE_ROOT, normalized);
  const relative = path.relative(SEED_SOURCE_ROOT, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(candidate)) {
    throw new Error(`Seed asset source not found: ${source}`);
  }
  return candidate;
}

function guessMimeByExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

function importSourceAsset(source: string, map: MapJson): string {
  if (map.bySource[source]) return map.bySource[source];
  const filePath = resolveSeedPath(source);
  const data = fs.readFileSync(filePath);
  const hash = sha256Buffer(data);
  const existing = map.byHash[hash];
  if (existing && assetExists(existing)) {
    map.bySource[source] = existing;
    return existing;
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const key = buildAssetKey(ext);
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  fs.writeFileSync(path.join(STORAGE_ROOT, key), data);
  map.bySource[source] = key;
  map.byHash[hash] = key;
  return key;
}

async function mapConcurrent<T>(
  items: T[],
  run: (item: T) => Promise<void>,
  concurrency = SEED_CONCURRENCY,
): Promise<void> {
  let index = 0;
  const runNext = async (): Promise<void> => {
    const currentIndex = index++;
    if (currentIndex >= items.length) return;
    const current = items[currentIndex];
    if (current !== undefined) await run(current);
    return runNext();
  };
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runNext());
  await Promise.all(workers);
}

async function resolveResourceId(binding: SeedBinding): Promise<number> {
  if (binding.resourceId) return binding.resourceId;
  if (binding.memberDni) {
    const member = await db.selectFrom("member").select("id").where("dni", "=", binding.memberDni).executeTakeFirst();
    if (!member) throw new Error(`Member not found for asset seed dni=${binding.memberDni}`);
    return member.id;
  }
  throw new Error("Invalid seed binding; no resource identifier");
}

export async function seedAssetsAndBindings() {
  const map = readMap();
  const now = new Date().toISOString();

  await mapConcurrent(SEED_BINDINGS, async (binding) => {
    const storageKey = importSourceAsset(binding.source, map);
    const filePath = resolveSeedPath(binding.source);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const resourceId = await resolveResourceId(binding);

    const existingAsset = await db
      .selectFrom("asset")
      .select("id")
      .where("storageKey", "=", storageKey)
      .executeTakeFirst();
    let assetId: number;
    if (existingAsset) {
      assetId = existingAsset.id;
      await db
        .updateTable("asset")
        .set({ status: "active", deletedAt: null, deleteAfter: null })
        .where("id", "=", assetId)
        .execute();
    } else {
      const inserted = await db
        .insertInto("asset")
        .values({
          storageKey,
          bucket: "local",
          mimeDetected: guessMimeByExt(ext),
          ext,
          sizeBytes: buffer.byteLength,
          sha256: sha256Buffer(buffer),
          visibility: "public",
          status: "active",
          createdBy: null,
          createdAt: now,
          deletedAt: null,
          deleteAfter: null,
        })
        .executeTakeFirst();
      assetId = Number(inserted.insertId);
    }

    await db
      .updateTable("asset_binding")
      .set({ isCurrent: 0, replacedAt: now })
      .where("resourceType", "=", binding.resourceType)
      .where("resourceId", "=", resourceId)
      .where("slot", "=", binding.slot)
      .where("isCurrent", "=", 1)
      .where("deletedAt", "is", null)
      .execute();

    const existingBinding = await db
      .selectFrom("asset_binding")
      .select("id")
      .where("resourceType", "=", binding.resourceType)
      .where("resourceId", "=", resourceId)
      .where("slot", "=", binding.slot)
      .where("assetId", "=", assetId)
      .where("isCurrent", "=", 1)
      .where("deletedAt", "is", null)
      .executeTakeFirst();
    if (!existingBinding) {
      await db
        .insertInto("asset_binding")
        .values({
          resourceType: binding.resourceType,
          resourceId,
          slot: binding.slot,
          assetId,
          isCurrent: 1,
          replacedByBindingId: null,
          replacedAt: null,
          createdAt: now,
          deletedAt: null,
        })
        .execute();
    }
  });

  writeMap(map);
}

export async function auditAndQuarantineOrphans() {
  const rows = await db
    .selectFrom("asset_binding as b")
    .innerJoin("asset as a", "a.id", "b.assetId")
    .select("a.storageKey")
    .where("b.isCurrent", "=", 1)
    .where("b.deletedAt", "is", null)
    .where("a.status", "=", "active")
    .execute();

  const referenced = new Set<string>(rows.map((row) => row.storageKey));

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
  await mapConcurrent(files, async (file) => {
    if (referenced.has(file)) return;
    const ok = await quarantineAsset({ assetKey: file, reason: "orphan-audit" });
    if (ok) moved.push(file);
  });

  return { missingReferenced, moved };
}
