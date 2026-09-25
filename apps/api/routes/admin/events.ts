import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import type { EventTranslationTable } from "../../db/schema.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { requirePermission } from "../../middleware/authz.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const EventTranslationPayload = z.object({
  name: z.string().min(1),
  city: z.string().trim().min(1).nullable().default(null),
  country: z.string().trim().min(1).nullable().default(null),
});

const EventBody = z.object({
  translations: translationsSchema(EventTranslationPayload.shape),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("refs.read")(c, next);
  return requirePermission("refs.write")(c, next);
});

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await db
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
    .orderBy("event_translation.name", "asc")
    .execute();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("event").select(["id"]).where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);

  const translations = await db
    .selectFrom("event_translation")
    .select(["locale", "name", "city", "country"])
    .where("eventId", "=", id)
    .execute();

  return c.json({
    id,
    translations: Object.fromEntries(
      translations.map((tr) => [
        tr.locale,
        { name: tr.name, city: tr.city ?? undefined, country: tr.country ?? undefined },
      ]),
    ),
  });
});

router.post("/", zValidator("json", EventBody), async (c) => {
  const { translations } = c.req.valid("json");
  const id = await db.transaction().execute(async (trx) => {
    const result = await trx.insertInto("event").values({}).executeTakeFirstOrThrow();
    const eventId = Number(result.insertId);
    await trx
      .insertInto("event_translation")
      .values(
        Object.entries(translations).map(([locale, tr]): Omit<EventTranslationTable, "id"> => ({
          eventId,
          locale,
          name: tr.name,
          city: tr.city,
          country: tr.country,
        })),
      )
      .execute();
    return eventId;
  });

  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", EventBody), async (c) => {
  const { id } = c.req.valid("param");
  const { translations } = c.req.valid("json");

  await db.transaction().execute(async (trx) => {
    await trx.selectFrom("event").select("id").where("id", "=", id).executeTakeFirstOrThrow();
    await trx.deleteFrom("event_translation").where("eventId", "=", id).execute();
    await trx
      .insertInto("event_translation")
      .values(
        Object.entries(translations).map(([locale, tr]): Omit<EventTranslationTable, "id"> => ({
          eventId: id,
          locale,
          name: tr.name,
          city: tr.city,
          country: tr.country,
        })),
      )
      .execute();
  });

  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("event").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
