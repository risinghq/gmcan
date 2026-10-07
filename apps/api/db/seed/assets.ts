/* eslint-disable no-await-in-loop */
import fs from "node:fs";
import path from "node:path";

import { assetExists, putObject, sha256Buffer } from "../../lib/upload.js";
import { MEMBER_PHOTO_PLACEHOLDER_KEY } from "../../routes/public/content/placeholders.js";
import { db } from "../client.js";
import type { Database } from "../schema.js";

const SEED_SOURCE_ROOT = path.resolve(process.cwd(), "assets/seed-src");

type SeedBinding =
  | {
      table: "member_asset";
      ownerColumn: "memberId";
      ownerId?: number;
      memberDni?: string;
      slot: "photo";
      source: string;
    }
  | { table: "news_asset"; ownerColumn: "newsId"; ownerId: number; slot: "photo"; source: string }
  | { table: "method_asset"; ownerColumn: "methodId"; ownerId: number; slot: "photo"; source: string }
  | { table: "research_line_asset"; ownerColumn: "researchLineId"; ownerId: number; slot: "photo"; source: string }
  | { table: "publication_asset"; ownerColumn: "publicationId"; ownerId: number; slot: "file"; source: string }
  | {
      table: "research_group_asset";
      ownerColumn: "groupId";
      ownerId: number;
      slot: "facilities" | "header" | "footer";
      source: string;
    }
  | { table: "about_asset"; ownerColumn: "aboutId"; ownerId: number; slot: "photo"; source: string };

const SEED_BINDINGS: SeedBinding[] = [
  {
    table: "member_asset",
    ownerColumn: "memberId",
    memberDni: "06766048",
    slot: "photo",
    source: "seed/members/justo.jpg",
  },
  {
    table: "member_asset",
    ownerColumn: "memberId",
    memberDni: "09934476",
    slot: "photo",
    source: "seed/members/chachi.png",
  },
  {
    table: "member_asset",
    ownerColumn: "memberId",
    memberDni: "73184556",
    slot: "photo",
    source: "seed/members/renzo-vizarreta.jpg",
  },
  { table: "news_asset", ownerColumn: "newsId", ownerId: 56, slot: "photo", source: "seed/news/news-56.jpg" },
  {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    ownerId: 1,
    slot: "photo",
    source: "seed/research-lines/structural-nanoparticles.jpg",
  },
  {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    ownerId: 2,
    slot: "photo",
    source: "seed/research-lines/hexagonal-nanosystems.jpg",
  },
  {
    table: "research_line_asset",
    ownerColumn: "researchLineId",
    ownerId: 3,
    slot: "photo",
    source: "seed/research-lines/nanomagnetism.jpg",
  },
  {
    table: "method_asset",
    ownerColumn: "methodId",
    ownerId: 1,
    slot: "photo",
    source: "seed/methods/molecular-dynamics.jpg",
  },
  { table: "method_asset", ownerColumn: "methodId", ownerId: 2, slot: "photo", source: "seed/methods/dft.jpg" },
  {
    table: "method_asset",
    ownerColumn: "methodId",
    ownerId: 3,
    slot: "photo",
    source: "seed/methods/monte-carlo.jpeg",
  },
  {
    table: "method_asset",
    ownerColumn: "methodId",
    ownerId: 4,
    slot: "photo",
    source: "seed/methods/spin-dynamics.jpg",
  },
  {
    table: "publication_asset",
    ownerColumn: "publicationId",
    ownerId: 2,
    slot: "file",
    source: "seed/publications/GymxaQPxRqoXvImvfZcKWAfw.pdf",
  },
  {
    table: "publication_asset",
    ownerColumn: "publicationId",
    ownerId: 3,
    slot: "file",
    source: "seed/publications/N3eSqMJvE1F0HWXspbEfplB6.pdf",
  },
  {
    table: "research_group_asset",
    ownerColumn: "groupId",
    ownerId: 1,
    slot: "facilities",
    source: "seed/group/facilities.png",
  },
  {
    table: "research_group_asset",
    ownerColumn: "groupId",
    ownerId: 1,
    slot: "header",
    source: "seed/group/header.png",
  },
  {
    table: "research_group_asset",
    ownerColumn: "groupId",
    ownerId: 1,
    slot: "footer",
    source: "seed/group/footer.png",
  },
  { table: "about_asset", ownerColumn: "aboutId", ownerId: 1, slot: "photo", source: "seed/about/grupal.jpg" },
];

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
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
}

async function resolveOwnerId(binding: SeedBinding): Promise<number> {
  if ("ownerId" in binding && binding.ownerId) return binding.ownerId;
  if ("memberDni" in binding && binding.memberDni) {
    const member = await db.selectFrom("member").select("id").where("dni", "=", binding.memberDni).executeTakeFirst();
    if (!member) throw new Error(`Member not found for asset seed dni=${binding.memberDni}`);
    return member.id;
  }
  throw new Error("Invalid seed binding; no owner identifier");
}

async function insertTypedBinding(binding: SeedBinding, ownerId: number, assetId: number, now: string) {
  const row = {
    [binding.ownerColumn]: ownerId,
    slot: binding.slot,
    version: 1,
    assetId,
    actorId: null,
    reason: "seed",
    createdAt: now,
  };
  await db
    .insertInto(binding.table as keyof Database & string)
    .values(row as never)
    .onConflict((oc) => oc.doNothing())
    .execute();
}

export async function seedAssetsAndBindings() {
  const now = new Date().toISOString();
  await putObject(
    MEMBER_PHOTO_PLACEHOLDER_KEY,
    fs.readFileSync(path.resolve(process.cwd(), "assets/member-photo-placeholder.png")),
  );

  for (const binding of SEED_BINDINGS) {
    const ownerId = await resolveOwnerId(binding);
    const filePath = resolveSeedPath(binding.source);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const sha256 = sha256Buffer(buffer);
    const storageKey = `${sha256}.${ext}`;
    const mimeDetected = guessMimeByExt(ext);

    if (!(await assetExists(storageKey))) await putObject(storageKey, buffer);

    await db
      .insertInto("asset")
      .values({
        storageKey,
        bucket: "r2",
        mimeDetected,
        ext,
        sizeBytes: buffer.byteLength,
        sha256,
        visibility: "public",
        lifecycleStatus: "active",
        createdBy: null,
        createdAt: now,
        deletedAt: null,
      })
      .onConflict((oc) =>
        oc.column("storageKey").doUpdateSet({
          mimeDetected,
          ext,
          sizeBytes: buffer.byteLength,
          sha256,
          lifecycleStatus: "active",
          deletedAt: null,
        }),
      )
      .execute();

    const asset = await db.selectFrom("asset").select("id").where("storageKey", "=", storageKey).executeTakeFirst();
    if (!asset) throw new Error(`Asset row not found for storageKey=${storageKey}`);
    await insertTypedBinding(binding, ownerId, asset.id, now);
  }
}
