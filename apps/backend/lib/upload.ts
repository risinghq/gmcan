import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { Context } from "hono";

export const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export const UPLOAD_FILE_KIND_EXTENSIONS = {
  image: ["png", "jpg", "jpeg"],
  brandImage: ["png", "svg"],
  document: ["pdf"],
} as const;

export type UploadFileKind = keyof typeof UPLOAD_FILE_KIND_EXTENSIONS;

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const SAFE_FILE_NAME = /^[A-Za-z0-9._-]+$/;

function resolveUploadFilePath(fileName: string): string | null {
  if (!SAFE_FILE_NAME.test(fileName)) return null;
  const filePath = path.resolve(UPLOADS_ROOT, fileName);
  const relative = path.relative(UPLOADS_ROOT, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return filePath;
}

function extensionOf(fileName: string): string {
  return path.extname(fileName).slice(1).toLowerCase();
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

export async function serveFile(c: Context, filePath: string): Promise<Response> {
  const absolutePath = path.resolve(filePath);
  const relative = path.relative(UPLOADS_ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return c.json({ error: "Invalid file path" }, 400);
  if (!fs.existsSync(absolutePath)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(absolutePath);
  const ext = extensionOf(absolutePath);
  return c.body(data, 200, {
    "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
}

export async function saveUploadedFile(file: File, options: { kind: UploadFileKind }): Promise<string | null> {
  const ext = extensionOf(file.name);
  const allowedExtensions = UPLOAD_FILE_KIND_EXTENSIONS[options.kind] as readonly string[];
  if (!allowedExtensions.includes(ext)) return null;

  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = resolveUploadFilePath(fileName);
  if (!filePath) throw new Error("Unable to build file path");

  await fs.promises.mkdir(UPLOADS_ROOT, { recursive: true });
  await fs.promises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return fileName;
}

export async function serveUploadedFile(
  c: Context,
  options: { fileName: string; asAttachment?: boolean },
): Promise<Response> {
  const filePath = resolveUploadFilePath(options.fileName);
  if (!filePath) return c.json({ error: "Invalid file path" }, 400);
  if (!options.asAttachment) return serveFile(c, filePath);

  if (!fs.existsSync(filePath)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(filePath);
  const ext = extensionOf(options.fileName);
  return c.body(data, 200, {
    "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${options.fileName}"`,
  });
}

export async function deleteUploadedFile(options: { fileName: string }): Promise<boolean> {
  const filePath = resolveUploadFilePath(options.fileName);
  if (!filePath || !fs.existsSync(filePath)) return false;
  await fs.promises.unlink(filePath);
  return true;
}
