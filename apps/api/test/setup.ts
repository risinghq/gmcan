import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Set before any module reads config/env.ts, so every test shares one fresh database and bucket.
const dir = mkdtempSync(join(tmpdir(), "gmcan-api-test-"));
process.env.GMCAN_STATE_DIR = dir;
process.env.NODE_ENV = "test";
process.env.ASSET_SIGNING_SECRET = "test-secret";
process.env.INSTITUTIONAL_EMAIL = "institutional@example.test";
process.env.SUPPORTED_LOCALES = "es,en";
process.env.DEFAULT_LOCALE = "es";
process.on("exit", () => rmSync(dir, { recursive: true, force: true }));

const migrate = Bun.spawnSync(
  ["bunx", "wrangler", "d1", "migrations", "apply", "gmcan", "--local", "--persist-to", dir],
  {
    cwd: join(import.meta.dir, ".."),
    stderr: "pipe",
    stdout: "pipe",
  },
);
if (migrate.exitCode !== 0) throw new Error(`Applying migrations failed:\n${migrate.stdout}\n${migrate.stderr}`);

await import("../scripts/cloudflare-bun.js");
(await import("./query-counter.js")).installQueryCounter();
const { seedLocales, seedLookups } = await import("../db/seed/lookups.js");

await seedLocales();
await seedLookups();
