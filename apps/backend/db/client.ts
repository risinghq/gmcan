import { createClient } from "@libsql/client";
import { Kysely } from "kysely";
import { LibsqlDialect } from "kysely-libsql";

import type { Database } from "./schema.js";

const client = createClient({
  url: process.env.LIBSQL_URL ?? "file:./data/gmcan.db",
  authToken: process.env.LIBSQL_AUTH_TOKEN,
});

export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({ client }),
});
