import { db } from "../db/client.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";

export interface DashboardCountItem<TCode extends string = string> {
  code: TCode;
  label: string;
  count: number;
}

function numericCount(value: string | number | bigint | null | undefined): number {
  return Number(value ?? 0);
}

export async function getDashboardSummary(locale: Locale = DEFAULT_LOCALE) {
  const [membersByTypeRows, publicationsByKindRows] = await Promise.all([
    db
      .selectFrom("member")
      .innerJoin("member_type_translation", (join) =>
        join
          .onRef("member_type_translation.memberTypeCode", "=", "member.memberTypeCode")
          .on("member_type_translation.locale", "=", locale),
      )
      .select((eb) => [
        "member.memberTypeCode as code",
        "member_type_translation.name as label",
        eb.fn.count<number>("member.id").as("count"),
      ])
      .groupBy(["member.memberTypeCode", "member_type_translation.name"])
      .orderBy("member_type_translation.name", "asc")
      .execute(),
    db
      .selectFrom("publication")
      .innerJoin("publication_kind_translation", (join) =>
        join
          .onRef("publication_kind_translation.publicationKindCode", "=", "publication.kindCode")
          .on("publication_kind_translation.locale", "=", locale),
      )
      .select((eb) => [
        "publication.kindCode as code",
        "publication_kind_translation.name as label",
        eb.fn.count<number>("publication.id").as("count"),
      ])
      .groupBy(["publication.kindCode", "publication_kind_translation.name"])
      .orderBy("publication_kind_translation.name", "asc")
      .execute(),
  ]);

  return {
    membersByType: membersByTypeRows.map((row) => ({
      code: row.code,
      label: row.label,
      count: numericCount(row.count),
    })),
    publicationsByKind: publicationsByKindRows.map((row) => ({
      code: row.code,
      label: row.label,
      count: numericCount(row.count),
    })),
  };
}
