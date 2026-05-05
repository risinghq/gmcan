import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { Context } from "hono";

import { getBackendUrl } from "../config.js";
import { db } from "../db/client.js";

export const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  webp: "image/webp",
};

export const UPLOAD_FILE_KIND_EXTENSIONS = {
  image: ["png", "jpg", "jpeg", "webp"],
  brandImage: ["png", "svg"],
  document: ["pdf"],
} as const;

export type UploadFileKind = keyof typeof UPLOAD_FILE_KIND_EXTENSIONS;

type ReferenceExclusion = { table: string; id: number; column: string };

export const STORAGE_ROOT = path.resolve(process.cwd(), ".storage");
const QUARANTINE_ROOT = path.join(STORAGE_ROOT, ".quarantine");
const SAFE_ASSET_SEGMENT = /^[A-Za-z0-9._-]+$/;

function randomUuidV7(): string {
  const maybeBun = (globalThis as { Bun?: { randomUUIDv7?: () => string } }).Bun;
  if (maybeBun?.randomUUIDv7) return maybeBun.randomUUIDv7();
  const nowHex = Date.now().toString(16).padStart(12, "0");
  const rest = crypto.getRandomValues(new Uint8Array(10));
  const hex = [...rest].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${nowHex.slice(0, 8)}-${nowHex.slice(8, 12)}-7${hex.slice(0, 3)}-a${hex.slice(3, 6)}-${hex.slice(6, 18)}`;
}

export function normalizeAssetKey(assetKey: string): string | null {
  const normalized = assetKey.replaceAll("\\", "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  if (!segments.every((segment) => SAFE_ASSET_SEGMENT.test(segment) && segment !== "." && segment !== ".."))
    return null;
  return segments.join("/");
}

function resolveAssetPath(assetKey: string): { key: string; path: string } | null {
  const key = normalizeAssetKey(assetKey);
  if (!key) return null;
  const filePath = path.resolve(STORAGE_ROOT, key);
  const relative = path.relative(STORAGE_ROOT, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return { key, path: filePath };
}

function extensionOf(fileName: string): string {
  return path.extname(fileName).slice(1).toLowerCase();
}

export function buildAssetKey(ext: string): string {
  return `${randomUuidV7()}.${ext}`;
}

export function assetUrl(assetKey: string | null | undefined): string | null {
  const key = assetKey ? normalizeAssetKey(assetKey) : null;
  if (!key) return null;
  return `${getBackendUrl()}/api/assets/${encodeURIComponent(key)}`;
}

export function extractFirstFile(body: Record<string, string | File | (string | File)[]>): File | undefined {
  for (const value of Object.values(body)) {
    if (value instanceof File) return value;
    if (Array.isArray(value)) {
      const file = value.find((v): v is File => v instanceof File);
      if (file) return file;
    }
  }
  return undefined;
}

async function serveFile(c: Context, filePath: string): Promise<Response> {
  const absolutePath = path.resolve(filePath);
  const relative = path.relative(STORAGE_ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return c.json({ error: "Invalid file path" }, 400);
  if (!fs.existsSync(absolutePath)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(absolutePath);
  const ext = extensionOf(absolutePath);
  return c.body(data, 200, {
    "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
}

export async function saveUploadedFile(
  file: File,
  options: { domain: string; kind: UploadFileKind },
): Promise<string | null> {
  const ext = extensionOf(file.name);
  const allowedExtensions = UPLOAD_FILE_KIND_EXTENSIONS[options.kind] as readonly string[];
  if (!allowedExtensions.includes(ext)) return null;

  const assetKey = buildAssetKey(ext);
  const resolved = resolveAssetPath(assetKey);
  if (!resolved) throw new Error("Unable to build file path");

  await fs.promises.mkdir(path.dirname(resolved.path), { recursive: true });
  await fs.promises.writeFile(resolved.path, Buffer.from(await file.arrayBuffer()));
  return resolved.key;
}

export async function serveAsset(c: Context, options: { assetKey: string; asAttachment?: boolean }): Promise<Response> {
  const resolved = resolveAssetPath(options.assetKey);
  if (!resolved) return c.json({ error: "Invalid asset key" }, 400);
  if (!options.asAttachment) return serveFile(c, resolved.path);

  if (!fs.existsSync(resolved.path)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(resolved.path);
  const ext = extensionOf(resolved.key);
  return c.body(data, 200, {
    "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${resolved.key}"`,
  });
}

async function isReferenced(key: string, exclude?: ReferenceExclusion): Promise<boolean> {
  const checks: Array<{ table: string; column: string }> = [
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

  const queries = checks.map((check) => {
    let query = db
      .selectFrom(check.table as never)
      .select("id" as never)
      .where(check.column as never, "=", key as never);
    if (exclude && exclude.table === check.table && exclude.column === check.column) {
      query = query.where("id" as never, "!=", exclude.id as never);
    }
    return query.executeTakeFirst();
  });

  const results = await Promise.all(queries);
  return results.some((r) => !!r);
}

export async function quarantineAsset(options: { assetKey: string; reason: string }): Promise<boolean> {
  const resolved = resolveAssetPath(options.assetKey);
  if (!resolved || !fs.existsSync(resolved.path)) return false;
  await fs.promises.mkdir(QUARANTINE_ROOT, { recursive: true });
  const target = path.join(QUARANTINE_ROOT, resolved.key);
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.rename(resolved.path, target);
  const reportLine = `${new Date().toISOString()}\t${resolved.key}\t${options.reason}\n`;
  await fs.promises.appendFile(path.join(QUARANTINE_ROOT, "report.tsv"), reportLine, "utf8");
  return true;
}

export async function deleteUploadedFile(options: {
  assetKey: string | null | undefined;
  exclude?: ReferenceExclusion;
}): Promise<boolean> {
  if (!options.assetKey) return false;
  const key = normalizeAssetKey(options.assetKey);
  if (!key) return false;
  if (await isReferenced(key, options.exclude)) return false;
  return quarantineAsset({ assetKey: key, reason: "unreferenced" });
}

export function assetExists(assetKey: string): boolean {
  const resolved = resolveAssetPath(assetKey);
  return !!resolved && fs.existsSync(resolved.path);
}

export function sha256Buffer(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
