import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Set before any module reads config/env.ts, so every test shares one fresh database.
const dir = mkdtempSync(join(tmpdir(), "gmcan-api-test-"));
process.env.NODE_ENV = "test";
process.env.LIBSQL_URL = `file:${join(dir, "test.db")}`;
process.env.ASSET_SIGNING_SECRET = "test-secret";
process.env.SUPPORTED_LOCALES = "es,en";
process.env.DEFAULT_LOCALE = "es";
process.on("exit", () => rmSync(dir, { recursive: true, force: true }));

const { db } = await import("../db/client.js");
const { createTables } = await import("../db/ddl.js");
const { seedLocales, seedLookups } = await import("../db/seed/lookups.js");

await createTables(db);
await seedLocales();
await seedLookups();
