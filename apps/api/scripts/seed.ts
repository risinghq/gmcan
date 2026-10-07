// Seeds sample data. Without flags it fills the local D1 and R2 emulation under .wrangler/state.
// With --remote it seeds a scratch copy, then pushes that data to the deployed D1 database and R2
// bucket, which must already be migrated and empty.
import { Database } from "bun:sqlite";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Tables whose rows are derived: wrangler's migration bookkeeping and the FTS index, which triggers fill.
const SKIPPED_TABLES = /^(d1_migrations|_cf_.*|sqlite_.*|news_fts(_.*)?)$/;

const apiDir = resolve(import.meta.dir, "..");
const remote = process.argv.includes("--remote");
const stateDir = remote ? mkdtempSync(join(tmpdir(), "gmcan-seed-")) : join(apiDir, ".wrangler/state");
process.env.GMCAN_STATE_DIR = stateDir;
// wrangler.jsonc declares production; the seed runs against local emulation and never signs anything.
process.env.NODE_ENV = "development";
process.env.ASSET_SIGNING_SECRET ??= "seed-only";

function wrangler(...args: string[]) {
  const result = Bun.spawnSync(["bunx", "wrangler", ...args], { cwd: apiDir, stdout: "inherit", stderr: "inherit" });
  if (result.exitCode !== 0) throw new Error(`wrangler ${args.slice(0, 3).join(" ")} failed`);
}

wrangler("d1", "migrations", "apply", "gmcan", "--local", "--persist-to", stateDir);
await import("./cloudflare-bun.js");
const { seed } = await import("../db/seed.js");
await seed();

if (remote) await pushToCloudflare();
process.exit(0);

function dumpData(): string {
  const dbDir = join(stateDir, "v3/d1/miniflare-D1DatabaseObject");
  const file = readdirSync(dbDir).find((name) => name.endsWith(".sqlite"));
  if (!file) throw new Error(`No local D1 database under ${dbDir}`);
  const sqlite = new Database(join(dbDir, file), { readonly: true });
  const tables = sqlite
    .query<{ name: string }, []>("select name from sqlite_master where type = 'table' order by rowid")
    .all()
    .map((row) => row.name)
    .filter((name) => !SKIPPED_TABLES.test(name));

  const statements = ["PRAGMA defer_foreign_keys = on;"];
  for (const table of tables) {
    const columns = sqlite.query<{ name: string }, []>(`select name from pragma_table_info('${table}')`).all();
    const names = columns.map((column) => `"${column.name}"`);
    const quoted = names.map((name) => `quote(${name})`).join(" || ',' || ");
    const rows = sqlite.query<{ values: string }, []>(`select ${quoted} as "values" from "${table}"`).all();
    for (const row of rows) statements.push(`INSERT INTO "${table}" (${names.join(",")}) VALUES (${row.values});`);
  }
  sqlite.close();
  return statements.join("\n");
}

async function pushToCloudflare() {
  const { env } = await import("cloudflare:workers");
  const sqlFile = join(stateDir, "seed.sql");
  writeFileSync(sqlFile, dumpData());
  wrangler("d1", "execute", "gmcan", "--remote", "--yes", "--file", sqlFile);

  const keys = (await env.STORAGE.list()).objects.map((object) => object.key);
  for (const key of keys) {
    const object = await env.STORAGE.get(key);
    if (!object) continue;
    const objectFile = join(stateDir, "object");
    writeFileSync(objectFile, new Uint8Array(await object.arrayBuffer()));
    const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";
    wrangler(
      "r2",
      "object",
      "put",
      `gmcan-assets/${key}`,
      "--remote",
      "--file",
      objectFile,
      "--content-type",
      contentType,
    );
  }
}
