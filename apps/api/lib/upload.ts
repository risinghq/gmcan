import { createHash } from "node:crypto";

import { env } from "cloudflare:workers";
import type { Context } from "hono";

import { badRequest, notFound } from "./errors/app-error.js";

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

const SAFE_ASSET_SEGMENT = /^[A-Za-z0-9._-]+$/;

export function normalizeAssetKey(assetKey: string): string | null {
  const normalized = assetKey.replaceAll("\\", "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  if (!segments.every((segment) => SAFE_ASSET_SEGMENT.test(segment) && segment !== "." && segment !== ".."))
    return null;
  return segments.join("/");
}

function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

export function buildAssetKey(ext: string): string {
  return `${crypto.randomUUID()}.${ext}`;
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

export async function putObject(key: string, bytes: ArrayBuffer | Uint8Array): Promise<void> {
  await env.STORAGE.put(key, bytes, { httpMetadata: { contentType: MIME_TYPES[extensionOf(key)] } });
}

/** Stores the file under a new key and returns it, or returns null when the extension is not allowed for the kind. */
export async function saveUploadedFile(
  file: File,
  options: { kind: UploadFileKind; bytes?: Uint8Array },
): Promise<string | null> {
  const ext = extensionOf(file.name);
  const allowedExtensions: readonly string[] = UPLOAD_FILE_KIND_EXTENSIONS[options.kind];
  if (!allowedExtensions.includes(ext)) return null;

  const key = normalizeAssetKey(buildAssetKey(ext));
  if (!key) throw new Error("Unable to build file path");

  await putObject(key, options.bytes ?? (await file.arrayBuffer()));
  return key;
}

export async function serveAsset(
  c: Context,
  options: { assetKey: string; asAttachment?: boolean; private?: boolean },
): Promise<Response> {
  const key = normalizeAssetKey(options.assetKey);
  if (!key) throw badRequest("Invalid asset key");

  const object = await env.STORAGE.get(key);
  if (!object) throw notFound("File not found");

  const headers: Record<string, string> = {
    "Content-Type": MIME_TYPES[extensionOf(key)] ?? "application/octet-stream",
    "Content-Length": String(object.size),
  };
  if (options.asAttachment) headers["Content-Disposition"] = `attachment; filename="${key}"`;
  // Private assets are reached through a short-lived signed URL, so no shared cache may keep them.
  if (options.private) headers["Cache-Control"] = "private, no-store";
  else if (!options.asAttachment) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  // Streamed so the first byte leaves when R2 starts answering, not after the whole file has arrived.
  return c.body(object.body, 200, headers);
}

export async function assetExists(assetKey: string): Promise<boolean> {
  const key = normalizeAssetKey(assetKey);
  return key !== null && (await env.STORAGE.head(key)) !== null;
}

export function sha256Buffer(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
