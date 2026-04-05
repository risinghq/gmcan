import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { Context } from "hono";

export const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const SAFE_FILE_NAME = /^[A-Za-z0-9._-]+$/;
const SAFE_DIRECTORY = /^[A-Za-z0-9/_-]+$/;

function resolveUploadDirectory(directory: string): string {
  if (!SAFE_DIRECTORY.test(directory) || directory.includes("..")) {
    throw new Error("Invalid upload directory");
  }
  const directoryPath = path.resolve(UPLOADS_ROOT, directory);
  const relative = path.relative(UPLOADS_ROOT, directoryPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid upload directory");
  }
  return directoryPath;
}

function resolveUploadFilePath(directory: string, fileName: string): string | null {
  if (!SAFE_FILE_NAME.test(fileName)) return null;
  const directoryPath = resolveUploadDirectory(directory);
  const filePath = path.resolve(directoryPath, fileName);
  const relative = path.relative(directoryPath, filePath);
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
  return c.body(data, 200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
}

export async function saveUploadedFile(
  file: File,
  options: { directory: string; allowedExtensions: string[] },
): Promise<string | null> {
  const ext = extensionOf(file.name);
  if (!options.allowedExtensions.includes(ext)) return null;

  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  const directoryPath = resolveUploadDirectory(options.directory);
  const filePath = resolveUploadFilePath(options.directory, fileName);
  if (!filePath) throw new Error("Unable to build file path");

  await fs.promises.mkdir(directoryPath, { recursive: true });
  await fs.promises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return fileName;
}

export async function serveUploadedFile(c: Context, directory: string, fileName: string): Promise<Response> {
  const filePath = resolveUploadFilePath(directory, fileName);
  if (!filePath) return c.json({ error: "Invalid file path" }, 400);
  return serveFile(c, filePath);
}

export async function downloadUploadedFile(c: Context, directory: string, fileName: string): Promise<Response> {
  const filePath = resolveUploadFilePath(directory, fileName);
  if (!filePath) return c.json({ error: "Invalid file path" }, 400);
  if (!fs.existsSync(filePath)) return c.json({ error: "File not found" }, 404);

  const data = await fs.promises.readFile(filePath);
  const ext = extensionOf(fileName);
  return c.body(data, 200, {
    "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${fileName}"`,
  });
}

export async function deleteUploadedFile(directory: string, fileName: string): Promise<boolean> {
  const filePath = resolveUploadFilePath(directory, fileName);
  if (!filePath || !fs.existsSync(filePath)) return false;
  await fs.promises.unlink(filePath);
  return true;
}
