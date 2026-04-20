import { sql } from "kysely";

import { db } from "./client.js";
import { createTables, EXPECTED_COLUMNS } from "./ddl.js";
import { seed } from "./seed.js";

interface PragmaColumn {
  name: string;
}

async function sweepExpiredSessions() {
  await db.deleteFrom("session").where("expiresAt", "<", new Date().toISOString()).execute();
}

export async function bootstrap() {
  if (process.env.NODE_ENV === "production") return;

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
    console.error("  rm apps/backend/data/gmcan.db\n");
    process.exit(1);
  }

  await seed();

  await sweepExpiredSessions();
  setInterval(sweepExpiredSessions, 6 * 60 * 60 * 1000);

  console.log("[DB] Ready");
}
