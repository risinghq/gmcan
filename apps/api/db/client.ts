import { env } from "cloudflare:workers";
import { Kysely, sql, type Compilable, type RawBuilder } from "kysely";

import { d1Dialect, runAtomic } from "./d1.js";
import type { Database } from "./schema.js";

export const db = new Kysely<Database>({ dialect: d1Dialect(env.DB) });

/** Runs the queries in order as one transaction. Results keep the query order. */
export function atomic(queries: Compilable[]) {
  return runAtomic(env.DB, queries);
}

/**
 * Returns the newest row id for a table with an autoincrement key.
 * Use it when a later query in the batch needs the id from an earlier insert.
 */
export function lastInsertId(table: keyof Database & string): RawBuilder<number> {
  return sql<number>`(select max(id) from ${sql.table(table)})`;
}

/** Returns the id created by the insert at the given batch position. */
export function insertedId(results: Awaited<ReturnType<typeof atomic>>, index: number): number {
  const id = results[index]?.insertId;
  if (id === undefined) throw new Error(`The query at position ${index} inserted no row`);
  return Number(id);
}
