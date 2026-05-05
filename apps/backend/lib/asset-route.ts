import type { Context } from "hono";

import type { UploadFileKind } from "./upload.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "./upload.js";

type AssetRefRow<Column extends string> = Record<Column, string | null>;

export async function replaceAssetFile<Column extends string>(
  c: Context,
  options: {
    domain: string;
    kind: UploadFileKind;
    current: AssetRefRow<Column> | undefined;
    column: Column;
    set: (assetKey: string) => Promise<void>;
  },
): Promise<Response> {
  if (!options.current) return c.json({ error: "Not found" }, 404);
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  const assetKey = await saveUploadedFile(file, { domain: options.domain, kind: options.kind });
  if (!assetKey) return c.json({ error: "Invalid file type" }, 400);

  const previousAssetKey = options.current[options.column];
  await options.set(assetKey);
  if (previousAssetKey && previousAssetKey !== assetKey) {
    await deleteUploadedFile({ assetKey: previousAssetKey });
  }
  return c.json({ status: 1 });
}

export async function removeAssetFile<Column extends string>(
  c: Context,
  options: {
    current: AssetRefRow<Column> | undefined;
    column: Column;
    clear: () => Promise<void>;
  },
): Promise<Response> {
  const assetKey = options.current?.[options.column];
  if (!assetKey) return c.json({ error: "File not found" }, 404);
  await deleteUploadedFile({ assetKey });
  await options.clear();
  return c.json({ status: 1 });
}
