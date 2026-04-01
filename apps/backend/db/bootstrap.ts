import { sql } from "kysely";

import { db } from "./client.js";
import { createTables, EXPECTED_COLUMNS } from "./ddl.js";
import { seed } from "./seed.js";

interface PragmaColumn {
  name: string;
}

export async function bootstrap() {
  if (process.env.NODE_ENV === "production") return;

  // Enable FK enforcement for the session (no-op for HTTP/sqld targets)
  await sql`PRAGMA foreign_keys = ON`.execute(db);

  // Create all tables that don't yet exist
  await createTables(db);

  // Detect schema drift by comparing expected columns against PRAGMA table_info
  const issues: string[] = [];

  for (const [table, expectedCols] of Object.entries(EXPECTED_COLUMNS)) {
    const result = await sql<PragmaColumn>`PRAGMA table_info(${sql.raw(table)})`.execute(db);
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

  // Seed reference data and dev user on first run
  await seed();

  console.log("[DB] Ready");
}
