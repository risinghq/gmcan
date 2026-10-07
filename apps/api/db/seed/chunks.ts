import type { Compilable } from "kysely";

import { atomic } from "../client.js";

// D1 rejects statements with more than 100 bound parameters.
const MAX_PARAMETERS = 100;

/** Inserts the rows with as many statements as the parameter limit needs, in one transaction. */
export async function insertInChunks<Row extends object>(
  rows: Row[],
  insert: (chunk: Row[]) => Compilable,
): Promise<void> {
  if (rows.length === 0) return;
  const columns = Math.max(...rows.map((row) => Object.keys(row).length));
  const size = Math.max(1, Math.floor(MAX_PARAMETERS / columns));
  const statements: Compilable[] = [];
  for (let i = 0; i < rows.length; i += size) statements.push(insert(rows.slice(i, i + size)));
  await atomic(statements);
}
