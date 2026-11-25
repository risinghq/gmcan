import { env } from "cloudflare:workers";
import { Kysely, sql, type Compilable, type RawBuilder } from "kysely";

import { d1Dialect, runAtomic } from "./d1.js";
import type { Database } from "./schema.js";

export const db = new Kysely<Database>({ dialect: d1Dialect(env.DB) });

/** D1 allows 100 bound parameters per statement. An `in` list of 90 leaves room for the other values. */
const IN_LIST_LIMIT = 90;

/**
 * Runs `query` once per 90 ids, in parallel, and joins the rows. Use it for every `where ... in (ids)`
 * whose list grows with the data. Rows of one id stay together and in query order. The order between
 * chunks is the order of `ids`, so sort the result again when a global order matters.
 */
export async function queryInChunks<Id, Row>(
  ids: readonly Id[],
  query: (chunk: Id[]) => Promise<Row[]>,
): Promise<Row[]> {
  const unique = [...new Set(ids)];
  const chunks: Id[][] = [];
  for (let i = 0; i < unique.length; i += IN_LIST_LIMIT) chunks.push(unique.slice(i, i + IN_LIST_LIMIT));
  return (await Promise.all(chunks.map(query))).flat();
}

/** Runs the queries in order as one transaction. Results keep the query order. */
export function atomic(queries: Compilable[]) {
  return runAtomic(env.DB, queries);
}

type RowsOf<Queries extends readonly Compilable[]> = {
  [Index in keyof Queries]: Queries[Index] extends Compilable<infer Row> ? Row[] : never;
};

/**
 * Runs independent reads as one D1 call and returns each query's rows in query order. Use it when a
 * request already knows all of its reads up front: separate calls each pay a network round trip to
 * the database, and D1 runs them one at a time anyway. Reads that need an earlier result cannot join.
 */
export async function readBatch<const Queries extends readonly Compilable[]>(
  queries: Queries,
): Promise<RowsOf<Queries>> {
  const results = await runAtomic(env.DB, [...queries]);
  return results.map((result) => result.rows) as RowsOf<Queries>;
}

/**
 * Returns the newest row id for a table with an autoincrement key.
 * Use it when a later query in the batch needs the id from an earlier insert.
 */
export function lastInsertId(table: keyof Database & string): RawBuilder<number> {
  return sql<number>`(select max(id) from ${sql.table(table)})`;
}

export function insertedId(results: Awaited<ReturnType<typeof atomic>>, index: number): number {
  const id = results[index]?.insertId;
  if (id === undefined) throw new Error(`The query at position ${index} inserted no row`);
  return Number(id);
}
