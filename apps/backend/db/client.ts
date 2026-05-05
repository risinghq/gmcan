import { createClient } from "@libsql/client";
import { Kysely } from "kysely";
import { LibsqlDialect } from "kysely-libsql";

import { env } from "../config/env.js";
import type { Database } from "./schema.js";

const client = createClient({
  url: env.LIBSQL_URL,
  authToken: env.LIBSQL_AUTH_TOKEN,
});

export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({ client }),
});
