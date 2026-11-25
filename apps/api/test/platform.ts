// The Worker bindings the API uses, built on bun:sqlite and memory, so tests need no Cloudflare runtime.
// Each fake covers only the calls the code makes; a new binding method needs a line here.
import { Database, type SQLQueryBindings } from "bun:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** D1's limit on bound parameters per statement. SQLite allows far more, so the fake enforces it. */
const D1_MAX_PARAMETERS = 100;

type Run = () => D1Result;

function execute(sqlite: Database, sql: string, values: unknown[]): D1Result {
  if (values.length > D1_MAX_PARAMETERS) {
    throw new Error(`D1_ERROR: too many SQL variables: ${values.length} > ${D1_MAX_PARAMETERS}`);
  }

  const statement = sqlite.prepare(sql);
  const results = statement.all(...(values as SQLQueryBindings[]));
  const meta = sqlite.prepare("select changes() as changes, last_insert_rowid() as id").get() as {
    changes: number;
    id: number;
  };

  return {
    success: true,
    results,
    meta: { changes: meta.changes, last_row_id: meta.id },
  } as unknown as D1Result;
}

const runs = new WeakMap<D1PreparedStatement, Run>();

function prepared(sqlite: Database, sql: string, values: unknown[] = []): D1PreparedStatement {
  const run: Run = () => execute(sqlite, sql, values);
  const statement = {
    bind: (...next: unknown[]) => prepared(sqlite, sql, next),
    all: async () => run(),
  } as unknown as D1PreparedStatement;
  runs.set(statement, run);
  return statement;
}

function runOf(statement: D1PreparedStatement): Run {
  const run = runs.get(statement);
  if (!run) throw new Error("The batch holds a statement this database did not prepare");
  return run;
}

/** A D1 binding on an in-memory SQLite database. A batch runs in one transaction, as on D1. */
export function sqliteD1(sqlite: Database): D1Database {
  sqlite.run("PRAGMA foreign_keys = ON");

  return {
    prepare: (sql: string) => prepared(sqlite, sql),
    batch: async (statements: D1PreparedStatement[]) =>
      sqlite.transaction(() => statements.map((statement) => runOf(statement)()))(),
  } as unknown as D1Database;
}

/** Applies the migration files in name order, as `wrangler d1 migrations apply` does. */
export function applyMigrations(sqlite: Database, dir: string): void {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .toSorted();

  for (const file of files) sqlite.run(readFileSync(join(dir, file), "utf8"));
}

interface Stored {
  bytes: Uint8Array<ArrayBuffer>;
  httpMetadata?: R2HTTPMetadata;
}

function objectOf(key: string, stored: Stored) {
  return {
    key,
    size: stored.bytes.byteLength,
    httpMetadata: stored.httpMetadata,
    get body() {
      return new Blob([stored.bytes]).stream();
    },
    arrayBuffer: async () => stored.bytes.slice().buffer,
  };
}

/** An R2 binding that keeps objects in memory. */
export function memoryBucket(): R2Bucket {
  const objects = new Map<string, Stored>();

  return {
    put: async (key: string, value: ArrayBuffer | Uint8Array, options?: R2PutOptions) => {
      const bytes = new Uint8Array(value).slice();
      objects.set(key, { bytes, httpMetadata: options?.httpMetadata as R2HTTPMetadata | undefined });
    },
    get: async (key: string) => {
      const stored = objects.get(key);
      return stored ? objectOf(key, stored) : null;
    },
    head: async (key: string) => {
      const stored = objects.get(key);
      return stored ? objectOf(key, stored) : null;
    },
  } as unknown as R2Bucket;
}
