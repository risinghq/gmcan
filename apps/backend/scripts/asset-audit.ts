import { db } from "../db/client.js";
import { auditAndQuarantineOrphans } from "../db/seed/assets.js";
import { assetExists, normalizeAssetKey } from "../lib/upload.js";

const COLUMNS: Array<{ table: string; column: string }> = [
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

async function validateReferences() {
  const missing: Array<{ table: string; id: number; column: string; key: string }> = [];
  for (const { table, column } of COLUMNS) {
    const rows = await db.selectFrom(table as never).select(["id", column] as never).where(column as never, "is not", null).execute();
    for (const row of rows as Array<Record<string, unknown>>) {
      const rowId = Number(row.id);
      const value = String(row[column] ?? "");
      const key = normalizeAssetKey(value);
      if (!key || !assetExists(key)) {
        missing.push({ table, id: rowId, column, key: value });
      }
    }
  }
  return missing;
}

const missing = await validateReferences();
const orphanReport = await auditAndQuarantineOrphans();

console.log(JSON.stringify({ missingReferencedOnDisk: missing, orphanReport }, null, 2));
if (missing.length > 0) process.exit(1);
