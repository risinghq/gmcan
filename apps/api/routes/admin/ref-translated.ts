import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { getNewsTypeReferenceCount } from "../../services/ref.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const MemberTypeTranslationBody = z.object({
  translations: translationsSchema({
    name: z.string().min(1),
    nameSingular: z.string().min(1),
  }),
});

const NamedTranslationBody = z.object({
  translations: translationsSchema({
    name: z.string().min(1),
  }),
});

function setTranslation<T>(byId: Map<number, Record<string, T>>, id: number, locale: string, value: T) {
  const translations = byId.get(id);
  if (translations) {
    translations[locale] = value;
    return;
  }
  byId.set(id, { [locale]: value } as Record<string, T>);
}

router.get("/news-type/:id/count", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  return c.json(await getNewsTypeReferenceCount(id));
});

router.get("/member-type", async (c) => {
  const rows = await db
    .selectFrom("member_type")
    .innerJoin("member_type_translation", "member_type_translation.memberTypeId", "member_type.id")
    .select([
      "member_type.id as id",
      "member_type_translation.locale as locale",
      "member_type_translation.name as name",
      "member_type_translation.nameSingular as nameSingular",
    ])
    .execute();

  const byId = new Map<number, Record<string, { name: string; nameSingular: string }>>();
  for (const row of rows) {
    setTranslation(byId, row.id, row.locale, { name: row.name, nameSingular: row.nameSingular });
  }

  return c.json(Array.from(byId.entries()).map(([id, translations]) => ({ id, translations })));
});

router.get("/member-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("member_type").select(["id"]).where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);

  const translations = await db
    .selectFrom("member_type_translation")
    .select(["locale", "name", "nameSingular"])
    .where("memberTypeId", "=", id)
    .execute();

  return c.json({
    id,
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { name: tr.name, nameSingular: tr.nameSingular }]),
    ),
  });
});

router.post("/member-type", zValidator("json", MemberTypeTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const created = await db.insertInto("member_type").defaultValues().executeTakeFirstOrThrow();
  const id = Number(created.insertId);

  await db
    .insertInto("member_type_translation")
    .values(
      Object.entries(translations).map(([locale, payload]) => ({
        memberTypeId: id,
        locale,
        name: payload.name,
        nameSingular: payload.nameSingular,
      })),
    )
    .execute();

  return c.json({ id }, 201);
});

router.put(
  "/member-type/:id",
  zValidator("param", IdParam),
  zValidator("json", MemberTypeTranslationBody),
  async (c) => {
    const { id } = c.req.valid("param");
    const { translations } = c.req.valid("json");

    await db.transaction().execute(async (trx) => {
      await trx.selectFrom("member_type").select("id").where("id", "=", id).executeTakeFirstOrThrow();
      await trx.deleteFrom("member_type_translation").where("memberTypeId", "=", id).execute();
      await trx
        .insertInto("member_type_translation")
        .values(
          Object.entries(translations).map(([locale, payload]) => ({
            memberTypeId: id,
            locale,
            name: payload.name,
            nameSingular: payload.nameSingular,
          })),
        )
        .execute();
    });

    return c.json({ status: 1 });
  },
);

router.delete("/member-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("member_type").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

async function listNamedTranslated(
  table: "publication_type" | "thesis_type" | "news_type" | "university",
  _trTable:
    | "publication_type_translation"
    | "thesis_type_translation"
    | "news_type_translation"
    | "university_translation",
  _ownerCol: "publicationTypeId" | "thesisTypeId" | "newsTypeId" | "universityId",
) {
  const rows =
    table === "publication_type"
      ? await db
          .selectFrom("publication_type")
          .innerJoin(
            "publication_type_translation",
            "publication_type_translation.publicationTypeId",
            "publication_type.id",
          )
          .select([
            "publication_type.id as id",
            "publication_type_translation.locale as locale",
            "publication_type_translation.name as name",
          ])
          .execute()
      : table === "thesis_type"
        ? await db
            .selectFrom("thesis_type")
            .innerJoin("thesis_type_translation", "thesis_type_translation.thesisTypeId", "thesis_type.id")
            .select([
              "thesis_type.id as id",
              "thesis_type_translation.locale as locale",
              "thesis_type_translation.name as name",
            ])
            .execute()
        : table === "news_type"
          ? await db
              .selectFrom("news_type")
              .innerJoin("news_type_translation", "news_type_translation.newsTypeId", "news_type.id")
              .select([
                "news_type.id as id",
                "news_type_translation.locale as locale",
                "news_type_translation.name as name",
              ])
              .execute()
          : await db
              .selectFrom("university")
              .innerJoin("university_translation", "university_translation.universityId", "university.id")
              .select([
                "university.id as id",
                "university_translation.locale as locale",
                "university_translation.name as name",
              ])
              .execute();

  const byId = new Map<number, Record<string, { name: string }>>();
  for (const row of rows) {
    setTranslation(byId, row.id, row.locale, { name: row.name });
  }
  return Array.from(byId.entries()).map(([id, translations]) => ({ id, translations }));
}

async function getNamedTranslated(
  id: number,
  table: "publication_type" | "thesis_type" | "news_type" | "university",
  _trTable:
    | "publication_type_translation"
    | "thesis_type_translation"
    | "news_type_translation"
    | "university_translation",
  _ownerCol: "publicationTypeId" | "thesisTypeId" | "newsTypeId" | "universityId",
) {
  const [row, translations] =
    table === "publication_type"
      ? await Promise.all([
          db.selectFrom("publication_type").select("id").where("id", "=", id).executeTakeFirst(),
          db
            .selectFrom("publication_type_translation")
            .select(["locale", "name"])
            .where("publicationTypeId", "=", id)
            .execute(),
        ])
      : table === "thesis_type"
        ? await Promise.all([
            db.selectFrom("thesis_type").select("id").where("id", "=", id).executeTakeFirst(),
            db
              .selectFrom("thesis_type_translation")
              .select(["locale", "name"])
              .where("thesisTypeId", "=", id)
              .execute(),
          ])
        : table === "news_type"
          ? await Promise.all([
              db.selectFrom("news_type").select("id").where("id", "=", id).executeTakeFirst(),
              db.selectFrom("news_type_translation").select(["locale", "name"]).where("newsTypeId", "=", id).execute(),
            ])
          : await Promise.all([
              db.selectFrom("university").select("id").where("id", "=", id).executeTakeFirst(),
              db
                .selectFrom("university_translation")
                .select(["locale", "name"])
                .where("universityId", "=", id)
                .execute(),
            ]);
  if (!row) return null;

  return { id, translations: Object.fromEntries(translations.map((tr) => [tr.locale, { name: tr.name }])) };
}

async function createNamedTranslated(
  translations: Record<string, { name: string }>,
  table: "publication_type" | "thesis_type" | "news_type" | "university",
  trTable:
    | "publication_type_translation"
    | "thesis_type_translation"
    | "news_type_translation"
    | "university_translation",
  ownerCol: "publicationTypeId" | "thesisTypeId" | "newsTypeId" | "universityId",
) {
  const created = await db.insertInto(table).defaultValues().executeTakeFirstOrThrow();
  const id = Number(created.insertId);

  await db
    .insertInto(trTable)
    .values(Object.entries(translations).map(([locale, payload]) => ({ [ownerCol]: id, locale, name: payload.name })))
    .execute();

  return id;
}

async function updateNamedTranslated(
  id: number,
  translations: Record<string, { name: string }>,
  table: "publication_type" | "thesis_type" | "news_type" | "university",
  trTable:
    | "publication_type_translation"
    | "thesis_type_translation"
    | "news_type_translation"
    | "university_translation",
  ownerCol: "publicationTypeId" | "thesisTypeId" | "newsTypeId" | "universityId",
) {
  await db.transaction().execute(async (trx) => {
    await trx.selectFrom(table).select("id").where("id", "=", id).executeTakeFirstOrThrow();
    await trx.deleteFrom(trTable).where(ownerCol, "=", id).execute();
    await trx
      .insertInto(trTable)
      .values(Object.entries(translations).map(([locale, payload]) => ({ [ownerCol]: id, locale, name: payload.name })))
      .execute();
  });
}

router.get("/publication-type", async (c) =>
  c.json(await listNamedTranslated("publication_type", "publication_type_translation", "publicationTypeId")),
);
router.get("/publication-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNamedTranslated(id, "publication_type", "publication_type_translation", "publicationTypeId");
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/publication-type", zValidator("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await createNamedTranslated(
    translations,
    "publication_type",
    "publication_type_translation",
    "publicationTypeId",
  );
  return c.json({ id }, 201);
});
router.put(
  "/publication-type/:id",
  zValidator("param", IdParam),
  zValidator("json", NamedTranslationBody),
  async (c) => {
    const { id } = c.req.valid("param");
    await updateNamedTranslated(
      id,
      c.req.valid("json").translations,
      "publication_type",
      "publication_type_translation",
      "publicationTypeId",
    );
    return c.json({ status: 1 });
  },
);
router.delete("/publication-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("publication_type").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/thesis-type", async (c) =>
  c.json(await listNamedTranslated("thesis_type", "thesis_type_translation", "thesisTypeId")),
);
router.get("/thesis-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNamedTranslated(id, "thesis_type", "thesis_type_translation", "thesisTypeId");
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/thesis-type", zValidator("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await createNamedTranslated(translations, "thesis_type", "thesis_type_translation", "thesisTypeId");
  return c.json({ id }, 201);
});
router.put("/thesis-type/:id", zValidator("param", IdParam), zValidator("json", NamedTranslationBody), async (c) => {
  const { id } = c.req.valid("param");
  await updateNamedTranslated(
    id,
    c.req.valid("json").translations,
    "thesis_type",
    "thesis_type_translation",
    "thesisTypeId",
  );
  return c.json({ status: 1 });
});
router.delete("/thesis-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("thesis_type").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/news-type", async (c) =>
  c.json(await listNamedTranslated("news_type", "news_type_translation", "newsTypeId")),
);
router.get("/news-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNamedTranslated(id, "news_type", "news_type_translation", "newsTypeId");
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/news-type", zValidator("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await createNamedTranslated(translations, "news_type", "news_type_translation", "newsTypeId");
  return c.json({ id }, 201);
});
router.put("/news-type/:id", zValidator("param", IdParam), zValidator("json", NamedTranslationBody), async (c) => {
  const { id } = c.req.valid("param");
  await updateNamedTranslated(id, c.req.valid("json").translations, "news_type", "news_type_translation", "newsTypeId");
  return c.json({ status: 1 });
});
router.delete("/news-type/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("news_type").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/university", async (c) =>
  c.json(await listNamedTranslated("university", "university_translation", "universityId")),
);
router.get("/university/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNamedTranslated(id, "university", "university_translation", "universityId");
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/university", zValidator("json", NamedTranslationBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await createNamedTranslated(translations, "university", "university_translation", "universityId");
  return c.json({ id }, 201);
});
router.put("/university/:id", zValidator("param", IdParam), zValidator("json", NamedTranslationBody), async (c) => {
  const { id } = c.req.valid("param");
  await updateNamedTranslated(
    id,
    c.req.valid("json").translations,
    "university",
    "university_translation",
    "universityId",
  );
  return c.json({ status: 1 });
});
router.delete("/university/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("university").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
