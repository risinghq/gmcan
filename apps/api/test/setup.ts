import { Database } from "bun:sqlite";
import { join } from "node:path";

import { plugin } from "bun";

import { applyMigrations, memoryBucket, sqliteD1 } from "./platform.js";

// Every test file shares one in-memory database and bucket, built before any module reads the bindings.
const sqlite = new Database(":memory:");
applyMigrations(sqlite, join(import.meta.dir, "../migrations"));

const env = {
  DB: sqliteD1(sqlite),
  STORAGE: memoryBucket(),
  NODE_ENV: "test",
  ASSET_SIGNING_SECRET: "test-secret",
  INSTITUTIONAL_EMAIL: "institutional@example.test",
  SUPPORTED_LOCALES: "es,en",
  DEFAULT_LOCALE: "es",
};

plugin({
  name: "cloudflare-workers",
  setup(build) {
    build.module("cloudflare:workers", () => ({ exports: { env }, loader: "object" }));
  },
});

(await import("./query-counter.js")).installQueryCounter();
const { seedLocales, seedLookups } = await import("../db/seed/lookups.js");

await seedLocales();
await seedLookups();
