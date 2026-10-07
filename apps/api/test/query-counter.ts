import { env } from "cloudflare:workers";

let statements = 0;
let roundTrips = 0;

const real = new WeakMap<object, D1PreparedStatement>();

/** Wraps a statement to count direct execution. Batches unwrap it before execution. */
function counted(statement: D1PreparedStatement): D1PreparedStatement {
  const stand = {
    bind: (...values: unknown[]) => counted(statement.bind(...values)),
    all: (...args: []) => {
      roundTrips += 1;
      return statement.all(...args);
    },
  } as unknown as D1PreparedStatement;
  real.set(stand, statement);
  return stand;
}

/** Puts a counter in front of the D1 binding. Every call still runs on the real database. */
export function installQueryCounter(): void {
  const database = env.DB;
  env.DB = {
    prepare: (sql: string) => {
      statements += 1;
      return counted(database.prepare(sql));
    },
    batch: (batch: D1PreparedStatement[]) => {
      roundTrips += 1;
      return database.batch(batch.map((statement) => real.get(statement) ?? statement));
    },
    exec: (sql: string) => database.exec(sql),
    withSession: (...args: Parameters<D1Database["withSession"]>) => database.withSession(...args),
    dump: () => database.dump(),
  } as D1Database;
}

/** Counts D1 calls made by `run`; a batch counts once regardless of its statement count. */
export async function countRoundTrips(run: () => Promise<unknown>): Promise<number> {
  const before = roundTrips;
  await run();
  return roundTrips - before;
}

/** The D1 statements that `run` sends. A batch counts once per statement it holds, as D1 bills it. */
export async function countQueries(run: () => Promise<unknown>): Promise<number> {
  const before = statements;
  await run();
  return statements - before;
}
