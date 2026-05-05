import type { SelectExpression } from "kysely";

import type { Database } from "./schema.js";

export const MEMBER_PUBLIC = [
  "id",
  "dni",
  "email",
  "firstName",
  "lastName",
  "maternalName",
  "birthDate",
  "bio",
  "bioEN",
  "status",
  "roleId",
  "memberTypeId",
  "prefixId",
] as const satisfies ReadonlyArray<SelectExpression<Database, "member">>;

export const MEMBER_NAME = ["id", "dni", "firstName", "lastName", "maternalName"] as const satisfies ReadonlyArray<
  SelectExpression<Database, "member">
>;

export const MEMBER_ACTIVE = [
  "id",
  "dni",
  "firstName",
  "lastName",
  "maternalName",
  "email",
  "memberTypeId",
  "prefixId",
] as const satisfies ReadonlyArray<SelectExpression<Database, "member">>;
