import { db } from "../db/client.js";
import { type Locale } from "../lib/public-locale.js";

export async function getLookupData(locale: Locale) {
  const [
    memberTypes,
    publicationKinds,
    thesisKinds,
    newsKinds,
    fundingSources,
    currencies,
    roles,
    genders,
    prefixes,
    universities,
    journals,
    events,
  ] = await Promise.all([
    db
      .selectFrom("member_type")
      .innerJoin("member_type_translation", (join) =>
        join
          .onRef("member_type_translation.memberTypeCode", "=", "member_type.code")
          .on("member_type_translation.locale", "=", locale),
      )
      .select([
        "member_type.code as code",
        "member_type_translation.name as name",
        "member_type_translation.nameSingular as nameSingular",
      ])
      .execute(),
    db
      .selectFrom("publication_kind")
      .innerJoin("publication_kind_translation", (join) =>
        join
          .onRef("publication_kind_translation.publicationKindCode", "=", "publication_kind.code")
          .on("publication_kind_translation.locale", "=", locale),
      )
      .select(["publication_kind.code as code", "publication_kind_translation.name as name"])
      .execute(),
    db
      .selectFrom("thesis_kind")
      .innerJoin("thesis_kind_translation", (join) =>
        join
          .onRef("thesis_kind_translation.thesisKindCode", "=", "thesis_kind.code")
          .on("thesis_kind_translation.locale", "=", locale),
      )
      .select(["thesis_kind.code as code", "thesis_kind_translation.name as name"])
      .execute(),
    db
      .selectFrom("news_kind")
      .innerJoin("news_kind_translation", (join) =>
        join
          .onRef("news_kind_translation.newsKindCode", "=", "news_kind.code")
          .on("news_kind_translation.locale", "=", locale),
      )
      .select(["news_kind.code as code", "news_kind_translation.name as name"])
      .execute(),
    db.selectFrom("funding_source").select(["code", "name"]).execute(),
    db.selectFrom("currency").select(["code", "symbol"]).execute(),
    db.selectFrom("role").select(["code", "name"]).execute(),
    db.selectFrom("gender").select(["code", "name"]).execute(),
    db.selectFrom("prefix").select(["code", "label"]).execute(),
    db
      .selectFrom("university")
      .innerJoin("university_translation", (join) =>
        join
          .onRef("university_translation.universityId", "=", "university.id")
          .on("university_translation.locale", "=", locale),
      )
      .select(["university.id as id", "university_translation.name as name"])
      .execute(),
    db.selectFrom("journal").select(["id", "name"]).execute(),
    db
      .selectFrom("event")
      .innerJoin("event_translation", (join) =>
        join.onRef("event_translation.eventId", "=", "event.id").on("event_translation.locale", "=", locale),
      )
      .select([
        "event.id as id",
        "event_translation.name as name",
        "event_translation.city as city",
        "event_translation.country as country",
      ])
      .execute(),
  ]);

  return {
    memberTypes,
    publicationKinds,
    thesisKinds,
    newsKinds,
    fundingSources,
    currencies,
    roles,
    genders,
    prefixes,
    universities,
    journals,
    events,
  };
}
