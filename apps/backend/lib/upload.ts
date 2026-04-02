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
  if (!fs.existsSync(filePath)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return c.body(data, 200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
}
