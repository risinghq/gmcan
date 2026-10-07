import { db } from "../db/client.js";
import { SUPPORTED_LOCALES } from "../lib/locales.js";
import type { Locale } from "../lib/public-locale.js";

const REQUIRED_TRANSLATED_FIELDS = ["bio"] as const;

export function publicLocalizedMemberSelectQuery(locale: Locale) {
  let query = db
    .selectFrom("member")
    .innerJoin("member_translation", (join) =>
      join.onRef("member_translation.memberId", "=", "member.id").on("member_translation.locale", "=", locale),
    )
    .select([
      "member.id as id",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "member_translation.bio as bio",
      "member.isActive as isActive",
      "member.roleCode as roleCode",
      "member.memberTypeCode as memberTypeCode",
      "member.prefixCode as prefixCode",
    ])
    .where("member.isActive", "=", 1)
    .where("member.dni", "!=", "")
    .where("member.email", "!=", "")
    .where("member.firstName", "!=", "")
    .where("member.lastName", "!=", "");

  for (const field of REQUIRED_TRANSLATED_FIELDS) {
    query = query
      .where(`member_translation.${field}` as "member_translation.bio", "is not", null)
      .where(`member_translation.${field}` as "member_translation.bio", "!=", "");
  }

  for (const requiredLocale of SUPPORTED_LOCALES) {
    query = query.where((eb) =>
      eb.exists(
        REQUIRED_TRANSLATED_FIELDS.reduce(
          (inner, field) =>
            inner
              .where(`required_translation.${field}` as "required_translation.bio", "is not", null)
              .where(`required_translation.${field}` as "required_translation.bio", "!=", ""),
          eb
            .selectFrom("member_translation as required_translation")
            .select("required_translation.memberId")
            .whereRef("required_translation.memberId", "=", "member.id")
            .where("required_translation.locale", "=", requiredLocale),
        ),
      ),
    );
  }

  return query;
}
