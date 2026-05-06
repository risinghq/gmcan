import { db } from "../db/client.js";
import { SUPPORTED_LOCALES } from "../lib/locales.js";
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

export function publicLocalizedMemberSelectQuery(locale: Locale) {
  let query = localizedMemberSelectQuery(locale)
    .where("member_translation.bio", "is not", null)
    .where("member_translation.bio", "!=", "");

  for (const requiredLocale of SUPPORTED_LOCALES) {
    query = query.where((eb) =>
      eb.exists(
        eb
          .selectFrom("member_translation as required_translation")
          .select("required_translation.memberId")
          .whereRef("required_translation.memberId", "=", "member.id")
          .where("required_translation.locale", "=", requiredLocale)
          .where("required_translation.bio", "is not", null)
          .where("required_translation.bio", "!=", ""),
      ),
    );
  }

  return query;
}
