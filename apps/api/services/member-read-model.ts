import { db } from "../db/client.js";
import type { Locale } from "../lib/public-locale.js";

export function localizedMemberSelectQuery(locale: Locale) {
  return db
    .selectFrom("member")
    .innerJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", locale),
    )
    .select([
      "member.id as id",
      "member.dni as dni",
      "member.email as email",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "member.birthDate as birthDate",
      "member_translation.bio as bio",
      "member.status as status",
      "member.roleId as roleId",
      "member.memberTypeId as memberTypeId",
      "member.prefixId as prefixId",
    ]);
}
