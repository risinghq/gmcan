import { db } from "../db/client.js";

export async function getLookupData() {
  const [memberTypes, publicationTypes, thesisTypes, newsTypes, fundingSources, universities, journals, events] =
    await Promise.all([
      db.selectFrom("member_type").select(["id", "name", "nameEN", "nameSingular", "nameSingularEN"]).execute(),
      db.selectFrom("publication_type").select(["id", "name", "nameEN"]).execute(),
      db.selectFrom("thesis_type").select(["id", "name", "nameEN"]).execute(),
      db.selectFrom("news_type").select(["id", "name", "nameEN"]).execute(),
      db.selectFrom("funding_source").select(["id", "name"]).execute(),
      db.selectFrom("university").select(["id", "name", "nameEN"]).execute(),
      db.selectFrom("journal").select(["id", "name"]).execute(),
      db.selectFrom("event").select(["id", "name", "city", "cityEN", "country", "countryEN"]).execute(),
    ]);

  return { memberTypes, publicationTypes, thesisTypes, newsTypes, fundingSources, universities, journals, events };
}
