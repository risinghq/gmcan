import { db } from "../db/client.js";
import { type Locale } from "../lib/public-locale.js";

export async function getLookupData(locale: Locale) {
  const [memberTypes, publicationTypes, thesisTypes, newsTypes, fundingSources, universities, journals, events] =
    await Promise.all([
      db
        .selectFrom("member_type")
        .innerJoin("member_type_translation", (join) =>
          join
            .onRef("member_type_translation.memberTypeId", "=", "member_type.id")
            .on("member_type_translation.locale", "=", locale),
        )
        .select([
          "member_type.id as id",
          "member_type_translation.name as name",
          "member_type_translation.nameSingular as nameSingular",
        ])
        .execute(),
      db
        .selectFrom("publication_type")
        .innerJoin("publication_type_translation", (join) =>
          join
            .onRef("publication_type_translation.publicationTypeId", "=", "publication_type.id")
            .on("publication_type_translation.locale", "=", locale),
        )
        .select(["publication_type.id as id", "publication_type_translation.name as name"])
        .execute(),
      db
        .selectFrom("thesis_type")
        .innerJoin("thesis_type_translation", (join) =>
          join
            .onRef("thesis_type_translation.thesisTypeId", "=", "thesis_type.id")
            .on("thesis_type_translation.locale", "=", locale),
        )
        .select(["thesis_type.id as id", "thesis_type_translation.name as name"])
        .execute(),
      db
        .selectFrom("news_type")
        .innerJoin("news_type_translation", (join) =>
          join
            .onRef("news_type_translation.newsTypeId", "=", "news_type.id")
            .on("news_type_translation.locale", "=", locale),
        )
        .select(["news_type.id as id", "news_type_translation.name as name"])
        .execute(),
      db.selectFrom("funding_source").select(["id", "name"]).execute(),
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

  return { memberTypes, publicationTypes, thesisTypes, newsTypes, fundingSources, universities, journals, events };
}

export async function getNewsTypeReferenceCount(newsTypeId: number) {
  const row = await db
    .selectFrom("news")
    .select(({ fn }) => fn.count<number>("id").as("count"))
    .where("newsTypeId", "=", newsTypeId)
    .executeTakeFirstOrThrow();
  const count = Number(row.count);
  return { newsTypeId, count, canDelete: count === 0 };
}
