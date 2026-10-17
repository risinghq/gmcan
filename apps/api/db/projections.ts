import type { SelectExpression } from "kysely";

import type { Database } from "./schema.js";

export const MEMBER_NAME = ["id", "dni", "firstName", "lastName", "maternalName"] as const satisfies ReadonlyArray<
  SelectExpression<Database, "member">
>;
