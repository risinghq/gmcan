import { atomic, db, insertedId, lastInsertId } from "../db/client.js";
import type { EventTranslationTable } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { type Locale } from "../lib/public-locale.js";

export type EventTranslationInput = { name: string; city: string | null; country: string | null };

function localizedEventQuery(locale: Locale) {
  return db
    .selectFrom("event")
    .innerJoin("event_translation", (join) =>
      join.onRef("event_translation.eventId", "=", "event.id").on("event_translation.locale", "=", locale),
    )
    .select([
      "event.id as id",
      "event_translation.name as name",
      "event_translation.city as city",
      "event_translation.country as country",
    ]);
}

export async function listEventsLocalized(locale: Locale) {
  return localizedEventQuery(locale).execute();
}

export async function listAdminEvents(locale: Locale) {
  return localizedEventQuery(locale).orderBy("event_translation.name", "asc").execute();
}

export async function getEventLocalized(id: number, locale: Locale) {
  return localizedEventQuery(locale).where("event.id", "=", id).executeTakeFirst();
}

/** The event with its translations keyed by locale, or undefined when no event has this id. */
export async function getEventTranslations(id: number) {
  const row = await db.selectFrom("event").select(["id"]).where("id", "=", id).executeTakeFirst();
  if (!row) return undefined;

  const translations = await db
    .selectFrom("event_translation")
    .select(["locale", "name", "city", "country"])
    .where("eventId", "=", id)
    .execute();

  return {
    id,
    translations: Object.fromEntries(
      translations.map((tr) => [
        tr.locale,
        { name: tr.name, city: tr.city ?? undefined, country: tr.country ?? undefined },
      ]),
    ),
  };
}

export async function createEvent(translations: LocalizedTranslations<EventTranslationInput>) {
  const results = await atomic([
    db.insertInto("event").values({}),
    db.insertInto("event_translation").values(
      Object.entries(translations).map(([locale, tr]) => ({
        eventId: lastInsertId("event"),
        locale,
        name: tr.name,
        city: tr.city,
        country: tr.country,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateEvent(id: number, translations: LocalizedTranslations<EventTranslationInput>) {
  await db.selectFrom("event").select("id").where("id", "=", id).executeTakeFirstOrThrow();
  await atomic([
    db.deleteFrom("event_translation").where("eventId", "=", id),
    db.insertInto("event_translation").values(
      Object.entries(translations).map(([locale, tr]): Omit<EventTranslationTable, "id"> => ({
        eventId: id,
        locale,
        name: tr.name,
        city: tr.city,
        country: tr.country,
      })),
    ),
  ]);
}

export async function deleteEvent(id: number) {
  await db.deleteFrom("event").where("id", "=", id).execute();
}
