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
  "photo",
  "status",
  "roleId",
  "memberTypeId",
  "prefixId",
] as const satisfies ReadonlyArray<SelectExpression<Database, "member">>;

export const MEMBER_NAME = [
  "id",
  "dni",
  "firstName",
  "lastName",
  "maternalName",
  "photo",
] as const satisfies ReadonlyArray<SelectExpression<Database, "member">>;

export const MEMBER_ACTIVE = [
  "id",
  "dni",
  "firstName",
  "lastName",
  "maternalName",
  "email",
  "photo",
  "memberTypeId",
  "prefixId",
] as const satisfies ReadonlyArray<SelectExpression<Database, "member">>;
