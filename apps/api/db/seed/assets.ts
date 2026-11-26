/* eslint-disable no-await-in-loop */
import fs from "node:fs";
import path from "node:path";

import { assetExists, putObject, sha256Buffer } from "../../lib/upload.js";
import { db } from "../client.js";
import type { Database } from "../schema.js";
import { seedData } from "./data.js";
import { memberIdsByEmail } from "./members.js";

const SEED_SOURCE_ROOT = path.resolve(process.cwd(), "assets/seed-src");

type SeedBinding =
  | { table: "member_asset"; ownerColumn: "memberId"; ownerId: number; slot: "photo"; source: string }
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

type PhotoBinding = Extract<
  SeedBinding,
  { slot: "photo"; ownerColumn: "newsId" | "methodId" | "researchLineId" | "aboutId" }
>;

function photoBindings(
  items: Array<{ id: number; photo: string | null }>,
  owner: Pick<PhotoBinding, "table" | "ownerColumn">,
): SeedBinding[] {
  return items.flatMap((item) =>
    item.photo ? [{ ...owner, ownerId: item.id, slot: "photo", source: item.photo } as PhotoBinding] : [],
  );
}

async function seedBindings(): Promise<SeedBinding[]> {
  const { group, about, members, publications } = seedData;
  const memberIds = await memberIdsByEmail();

  const memberPhotos = members.flatMap((member): SeedBinding[] => {
    if (!member.photo) return [];
    const ownerId = memberIds.get(member.email);
    if (ownerId === undefined) throw new Error(`Seed member not found: ${member.email}`);
    return [{ table: "member_asset", ownerColumn: "memberId", ownerId, slot: "photo", source: member.photo }];
  });

  const publicationFiles = publications.flatMap((publication): SeedBinding[] =>
    publication.file
      ? [
          {
            table: "publication_asset",
            ownerColumn: "publicationId",
            ownerId: publication.id,
            slot: "file",
            source: publication.file,
          },
        ]
      : [],
  );

  const groupSlots = Object.entries(group.assets) as Array<[keyof typeof group.assets, string]>;
  const groupImages = groupSlots.map(([slot, source]): SeedBinding => ({
    table: "research_group_asset",
    ownerColumn: "groupId",
    ownerId: group.id,
    slot,
    source,
  }));

  return [
    ...memberPhotos,
    ...photoBindings(seedData.news, { table: "news_asset", ownerColumn: "newsId" }),
    ...photoBindings(seedData.researchLines, { table: "research_line_asset", ownerColumn: "researchLineId" }),
    ...photoBindings(seedData.methods, { table: "method_asset", ownerColumn: "methodId" }),
    ...photoBindings([about], { table: "about_asset", ownerColumn: "aboutId" }),
    ...publicationFiles,
    ...groupImages,
  ];
}

function resolveSeedPath(source: string): string {
  const candidate = path.resolve(SEED_SOURCE_ROOT, source);
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

async function insertTypedBinding(binding: SeedBinding, assetId: number, now: string) {
  const row = {
    [binding.ownerColumn]: binding.ownerId,
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
  for (const binding of await seedBindings()) {
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
    await insertTypedBinding(binding, asset.id, now);
  }
}
