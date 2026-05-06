import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { getUniversityPublicationDependencyCount } from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const NamedTranslationBody = z.object({
  translations: translationsSchema({ name: z.string().min(1) }),
});

function setTranslation<T>(byCode: Map<string, Record<string, T>>, code: string, locale: string, value: T) {
  const translations = byCode.get(code);
  if (translations) {
    translations[locale] = value;
    return;
  }
  byCode.set(code, { [locale]: value } as Record<string, T>);
}

router.get("/member-type", async (c) => {
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

  const byCode = new Map<string, Record<string, { name: string; nameSingular: string }>>();
  for (const row of rows)
    setTranslation(byCode, row.code, row.locale, { name: row.name, nameSingular: row.nameSingular });

  return c.json(Array.from(byCode.entries()).map(([code, translations]) => ({ code, translations })));
});

router.get("/publication-kind", async (c) => {
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
  const byCode = new Map<string, Record<string, { name: string }>>();
  for (const row of rows) setTranslation(byCode, row.code, row.locale, { name: row.name });
  return c.json(Array.from(byCode.entries()).map(([code, translations]) => ({ code, translations })));
});

router.get("/thesis-kind", async (c) => {
  const rows = await db
    .selectFrom("thesis_kind")
    .innerJoin("thesis_kind_translation", "thesis_kind_translation.thesisKindCode", "thesis_kind.code")
    .select([
      "thesis_kind.code as code",
      "thesis_kind_translation.locale as locale",
      "thesis_kind_translation.name as name",
    ])
    .execute();
  const byCode = new Map<string, Record<string, { name: string }>>();
  for (const row of rows) setTranslation(byCode, row.code, row.locale, { name: row.name });
  return c.json(Array.from(byCode.entries()).map(([code, translations]) => ({ code, translations })));
});

router.get("/news-kind", async (c) => {
  const rows = await db
    .selectFrom("news_kind")
    .innerJoin("news_kind_translation", "news_kind_translation.newsKindCode", "news_kind.code")
    .select(["news_kind.code as code", "news_kind_translation.locale as locale", "news_kind_translation.name as name"])
    .execute();
  const byCode = new Map<string, Record<string, { name: string }>>();
  for (const row of rows) setTranslation(byCode, row.code, row.locale, { name: row.name });
  return c.json(Array.from(byCode.entries()).map(([code, translations]) => ({ code, translations })));
});

router.get("/university", async (c) => {
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
  return c.json(Array.from(byId.entries()).map(([id, translations]) => ({ id, translations })));
});

router.get("/university/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("university").select("id").where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  const translations = await db
    .selectFrom("university_translation")
    .select(["locale", "name"])
    .where("universityId", "=", id)
    .execute();
  return c.json({ id, translations: Object.fromEntries(translations.map((tr) => [tr.locale, { name: tr.name }])) });
});

router.post("/university", zValidator("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await db.transaction().execute(async (trx) => {
    const created = await trx.insertInto("university").defaultValues().executeTakeFirstOrThrow();
    const universityId = Number(created.insertId);
    await trx
      .insertInto("university_translation")
      .values(
        Object.entries(translations).map(([locale, payload]) => ({
          universityId,
          locale,
          name: payload.name,
        })),
      )
      .execute();
    return universityId;
  });
  return c.json({ id }, 201);
});

router.put("/university/:id", zValidator("param", IdParam), zValidator("json", NamedTranslationBody), async (c) => {
  const { id } = c.req.valid("param");
  const { translations } = c.req.valid("json");
  await db.transaction().execute(async (trx) => {
    await trx.selectFrom("university").select("id").where("id", "=", id).executeTakeFirstOrThrow();
    await trx.deleteFrom("university_translation").where("universityId", "=", id).execute();
    await trx
      .insertInto("university_translation")
      .values(
        Object.entries(translations).map(([locale, payload]) => ({ universityId: id, locale, name: payload.name })),
      )
      .execute();
  });
  return c.json(okStatus());
});

router.delete("/university/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("university").where("id", "=", id).execute();
  return c.json(okStatus());
});

router.get("/university/:id/dependencies", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const thesis = await getUniversityPublicationDependencyCount(id);
  return c.json({
    total: thesis,
    byKind: { journalArticle: 0, conferencePaper: 0, thesis },
    canDelete: thesis === 0,
  });
});

export default router;
