import { sql } from "kysely";

import { env } from "../config/env.js";
import { db } from "./client.js";
import { createTables, ensureNewsSearchIndex, EXPECTED_COLUMNS } from "./ddl.js";
import { seed } from "./seed.js";

interface PragmaColumn {
  name: string;
}

// A failed sweep must not stop the server because requireSession rejects expired sessions.
async function sweepExpiredSessions() {
  try {
    await db.deleteFrom("session").where("expiresAt", "<", new Date().toISOString()).execute();
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    console.error(`[DB] Could not delete expired sessions: ${cause}`);
  }
}

async function startSessionSweep() {
  await sweepExpiredSessions();
  setInterval(sweepExpiredSessions, 6 * 60 * 60 * 1000);
}

// Search cannot run without the index, but a failure to build it must not stop the server.
async function ensureProductionNewsSearchIndex() {
  try {
    await ensureNewsSearchIndex(db);
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    console.error(`[DB] Could not build the news search index; news search will fail until this is fixed: ${cause}`);
  }
}

export async function bootstrap() {
  // Production gets no createTables, seed, or drift check; only the search index and the session sweep.
  if (env.NODE_ENV === "production") {
    await ensureProductionNewsSearchIndex();
    await startSessionSweep();
    return;
  }

  await sql`PRAGMA foreign_keys = ON`.execute(db);

  await createTables(db);

  const issues: string[] = [];
  const entries = Object.entries(EXPECTED_COLUMNS);
  const results = await Promise.all(
    entries.map(([table]) => sql<PragmaColumn>`PRAGMA table_info(${sql.raw(table)})`.execute(db)),
  );

  for (const [[table, expectedCols], result] of entries.map((e, i) => [e, results[i]] as const)) {
    const actualCols = result.rows.map((r) => r.name);
    const missing = expectedCols.filter((col) => !actualCols.includes(col));
    const extra = actualCols.filter((col) => !expectedCols.includes(col));
    if (missing.length) issues.push(`  Table '${table}': missing columns [${missing.join(", ")}]`);
    if (extra.length) issues.push(`  Table '${table}': unexpected columns [${extra.join(", ")}]`);
  }

  if (issues.length > 0) {
    console.error("\n[DB] Schema drift detected:");
    issues.forEach((issue) => console.error(issue));
    console.error("\n[DB] Delete the database file and restart to reset:");
    console.error("  rm apps/api/data/gmcan.db\n");
    process.exit(1);
  }

  await seed();

  await startSessionSweep();

  console.log("[DB] Ready");
}
