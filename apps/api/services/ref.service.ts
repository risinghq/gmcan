import { atomic, db, insertedId, lastInsertId, readBatch } from "../db/client.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
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
  ] = await readBatch([
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
      ]),
    db
      .selectFrom("publication_kind")
      .innerJoin("publication_kind_translation", (join) =>
        join
          .onRef("publication_kind_translation.publicationKindCode", "=", "publication_kind.code")
          .on("publication_kind_translation.locale", "=", locale),
      )
      .select(["publication_kind.code as code", "publication_kind_translation.name as name"]),
    db
      .selectFrom("thesis_kind")
      .innerJoin("thesis_kind_translation", (join) =>
        join
          .onRef("thesis_kind_translation.thesisKindCode", "=", "thesis_kind.code")
          .on("thesis_kind_translation.locale", "=", locale),
      )
      .select(["thesis_kind.code as code", "thesis_kind_translation.name as name"]),
    db
      .selectFrom("news_kind")
      .innerJoin("news_kind_translation", (join) =>
        join
          .onRef("news_kind_translation.newsKindCode", "=", "news_kind.code")
          .on("news_kind_translation.locale", "=", locale),
      )
      .select(["news_kind.code as code", "news_kind_translation.name as name"]),
    db.selectFrom("funding_source").select(["code", "name"]),
    db.selectFrom("currency").select(["code", "symbol"]),
    db.selectFrom("role").select(["code", "name"]),
    db.selectFrom("gender").select(["code", "name"]),
    db.selectFrom("prefix").select(["code", "label"]),
    db
      .selectFrom("university")
      .innerJoin("university_translation", (join) =>
        join
          .onRef("university_translation.universityId", "=", "university.id")
          .on("university_translation.locale", "=", locale),
      )
      .select(["university.id as id", "university_translation.name as name"]),
    db.selectFrom("journal").select(["id", "name"]),
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
      ]),
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

export async function listGenders() {
  return db.selectFrom("gender").select(["code", "name"]).execute();
}

export async function listPrefixes() {
  return db.selectFrom("prefix").select(["code", "label"]).execute();
}

export async function listRoles() {
  return db.selectFrom("role").select(["code", "name"]).execute();
}

export async function listFundingSources() {
  return db.selectFrom("funding_source").select(["code", "name"]).execute();
}

export async function listCurrencies() {
  return db.selectFrom("currency").select(["code", "symbol"]).execute();
}

export interface JournalInput {
  name: string;
}

export async function listJournals() {
  return db.selectFrom("journal").selectAll().execute();
}

export async function getJournal(id: number) {
  return db.selectFrom("journal").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function createJournal(data: JournalInput) {
  const result = await db.insertInto("journal").values(data).executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function updateJournal(id: number, data: JournalInput) {
  await db.updateTable("journal").set(data).where("id", "=", id).execute();
}

export async function deleteJournal(id: number) {
  await db.deleteFrom("journal").where("id", "=", id).execute();
}

/** Groups one row per (code, locale) into one entry per code, in first-seen order. */
function groupTranslations<R extends { code: string; locale: string }, T>(rows: readonly R[], value: (row: R) => T) {
  const byCode = new Map<string, Record<string, T>>();
  for (const row of rows) {
    const translations = byCode.get(row.code) ?? {};
    translations[row.locale] = value(row);
    byCode.set(row.code, translations);
  }
  return Array.from(byCode.entries()).map(([code, translations]) => ({ code, translations }));
}

export async function listMemberTypeTranslations() {
  const rows = await db
    .selectFrom("member_type")
    .innerJoin("member_type_translation", "member_type_translation.memberTypeCode", "member_type.code")
    .select([
      "member_type.code as code",
      "member_type_translation.locale as locale",
      "member_type_translation.name as name",
      "member_type_translation.nameSingular as nameSingular",
    ])
    .execute();
  return groupTranslations(rows, (row) => ({ name: row.name, nameSingular: row.nameSingular }));
}

export async function listPublicationKindTranslations() {
  const rows = await db
    .selectFrom("publication_kind")
    .innerJoin(
      "publication_kind_translation",
      "publication_kind_translation.publicationKindCode",
      "publication_kind.code",
    )
    .select([
      "publication_kind.code as code",
      "publication_kind_translation.locale as locale",
      "publication_kind_translation.name as name",
    ])
    .execute();
  return groupTranslations(rows, (row) => ({ name: row.name }));
}

export async function listThesisKindTranslations() {
  const rows = await db
    .selectFrom("thesis_kind")
    .innerJoin("thesis_kind_translation", "thesis_kind_translation.thesisKindCode", "thesis_kind.code")
    .select([
      "thesis_kind.code as code",
      "thesis_kind_translation.locale as locale",
      "thesis_kind_translation.name as name",
    ])
    .execute();
  return groupTranslations(rows, (row) => ({ name: row.name }));
}

export async function listNewsKindTranslations() {
  const rows = await db
    .selectFrom("news_kind")
    .innerJoin("news_kind_translation", "news_kind_translation.newsKindCode", "news_kind.code")
    .select(["news_kind.code as code", "news_kind_translation.locale as locale", "news_kind_translation.name as name"])
    .execute();
  return groupTranslations(rows, (row) => ({ name: row.name }));
}

export async function listUniversityTranslations() {
  const rows = await db
    .selectFrom("university")
    .innerJoin("university_translation", "university_translation.universityId", "university.id")
    .select(["university.id as id", "university_translation.locale as locale", "university_translation.name as name"])
    .execute();
  const byId = new Map<number, Record<string, { name: string }>>();
  for (const row of rows) {
    const current = byId.get(row.id) ?? {};
    current[row.locale] = { name: row.name };
    byId.set(row.id, current);
  }
  return Array.from(byId.entries()).map(([id, translations]) => ({ id, translations }));
}

/** The university with its translations keyed by locale, or undefined when no university has this id. */
export async function getUniversityTranslations(id: number) {
  const row = await db.selectFrom("university").select("id").where("id", "=", id).executeTakeFirst();
  if (!row) return undefined;
  const translations = await db
    .selectFrom("university_translation")
    .select(["locale", "name"])
    .where("universityId", "=", id)
    .execute();
  return { id, translations: Object.fromEntries(translations.map((tr) => [tr.locale, { name: tr.name }])) };
}

export async function createUniversity(translations: LocalizedTranslations<{ name: string }>) {
  const results = await atomic([
    db.insertInto("university").defaultValues(),
    db.insertInto("university_translation").values(
      Object.entries(translations).map(([locale, payload]) => ({
        universityId: lastInsertId("university"),
        locale,
        name: payload.name,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateUniversity(id: number, translations: LocalizedTranslations<{ name: string }>) {
  await db.selectFrom("university").select("id").where("id", "=", id).executeTakeFirstOrThrow();
  await atomic([
    db.deleteFrom("university_translation").where("universityId", "=", id),
    db
      .insertInto("university_translation")
      .values(
        Object.entries(translations).map(([locale, payload]) => ({ universityId: id, locale, name: payload.name })),
      ),
  ]);
}

export async function deleteUniversity(id: number) {
  await db.deleteFrom("university").where("id", "=", id).execute();
}
