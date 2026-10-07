import {
  type CompiledQuery,
  type Compilable,
  type DatabaseConnection,
  type Dialect,
  type Driver,
  type QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";

const NO_TRANSACTIONS =
  "D1 has no interactive transactions. Write the statements as one atomic() batch instead of db.transaction().";

function toQueryResult<R>(result: D1Result<R>): QueryResult<R> {
  const { changes, last_row_id: lastRowId } = result.meta;
  return {
    rows: result.results ?? [],
    numAffectedRows: BigInt(changes ?? 0),
    insertId: lastRowId == null ? undefined : BigInt(lastRowId),
  };
}

class D1Connection implements DatabaseConnection {
  constructor(private readonly database: D1Database) {}

  async executeQuery<R>({ sql, parameters }: CompiledQuery): Promise<QueryResult<R>> {
    return toQueryResult(
      await this.database
        .prepare(sql)
        .bind(...parameters)
        .all<R>(),
    );
  }

  // oxlint-disable-next-line require-yield
  async *streamQuery(): AsyncIterableIterator<never> {
    throw new Error("D1 does not stream results.");
  }
}

class D1Driver implements Driver {
  constructor(private readonly database: D1Database) {}

  async init() {}
  async acquireConnection() {
    return new D1Connection(this.database);
  }
  async beginTransaction(): Promise<void> {
    throw new Error(NO_TRANSACTIONS);
  }
  async commitTransaction(): Promise<void> {
    throw new Error(NO_TRANSACTIONS);
  }
  async rollbackTransaction(): Promise<void> {
    throw new Error(NO_TRANSACTIONS);
  }
  async releaseConnection() {}
  async destroy() {}
}

/** SqliteAdapter reports one connection, so Kysely would queue every query behind the previous one. D1 has no such limit. */
class D1Adapter extends SqliteAdapter {
  override get supportsMultipleConnections(): boolean {
    return true;
  }
}

export function d1Dialect(database: D1Database): Dialect {
  return {
    createAdapter: () => new D1Adapter(),
    createDriver: () => new D1Driver(database),
    createQueryCompiler: () => new SqliteQueryCompiler(),
    createIntrospector: (db) => new SqliteIntrospector(db),
  };
}

/**
 * Runs the queries as one D1 batch: they execute in order inside a single transaction, and a failure
 * rolls all of them back. A statement cannot read an earlier result, so a child row names its parent
 * with `lastInsertId` instead of an id returned by the parent insert.
 */
export async function runAtomic(database: D1Database, queries: Compilable[]): Promise<QueryResult<unknown>[]> {
  const statements = queries.map((query) => {
    const { sql, parameters } = query.compile();
    return database.prepare(sql).bind(...parameters);
  });
  return (await database.batch(statements)).map(toQueryResult);
}
