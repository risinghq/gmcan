import { env } from "cloudflare:workers";

let statements = 0;

/** Puts a counter in front of the D1 binding. Every call still runs on the real database. */
export function installQueryCounter(): void {
  const database = env.DB;
  env.DB = {
    prepare: (sql: string) => {
      statements += 1;
      return database.prepare(sql);
    },
    batch: (batch: D1PreparedStatement[]) => database.batch(batch),
    exec: (sql: string) => database.exec(sql),
    withSession: (...args: Parameters<D1Database["withSession"]>) => database.withSession(...args),
    dump: () => database.dump(),
  } as D1Database;
}

/** The D1 statements that `run` sends. A batch counts once per statement it holds, as D1 bills it. */
export async function countQueries(run: () => Promise<unknown>): Promise<number> {
  const before = statements;
  await run();
  return statements - before;
}
