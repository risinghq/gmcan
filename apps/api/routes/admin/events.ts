import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import { translationsSchema } from "../../lib/admin-translations.js";
import { requirePermission } from "../../middleware/authz.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const EventBody = z.object({
  translations: translationsSchema({
    name: z.string().min(1),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("publications.read")(c, next);
  return requirePermission("publications.write")(c, next);
});

router.get("/", async (c) => {
  const rows = await db.selectFrom("event").select(["id", "name", "country", "city"]).orderBy("name", "asc").execute();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  const translations = await db
    .selectFrom("event_translation")
    .select(["locale", "name", "city", "country"])
    .where("eventId", "=", id)
    .execute();
  return c.json({
    id: row.id,
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
  const es = (translations as any).es;
  const result = await db
    .insertInto("event")
    .values({
      name: es.name,
      city: es.city ?? null,
      country: es.country ?? null,
    })
    .executeTakeFirstOrThrow();
  const id = Number(result.insertId);

  await db
    .insertInto("event_translation")
    .values(
      Object.entries(translations).map(([locale, tr]) => ({
        eventId: id,
        locale,
        name: (tr as any).name,
        city: (tr as any).city ?? null,
        country: (tr as any).country ?? null,
      })),
    )
    .execute();

  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", EventBody), async (c) => {
  const { id } = c.req.valid("param");
  const { translations } = c.req.valid("json");
  const es = (translations as any).es;

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("event")
      .set({
        name: es.name,
        city: es.city ?? null,
        country: es.country ?? null,
      })
      .where("id", "=", id)
      .execute();

    await trx.deleteFrom("event_translation").where("eventId", "=", id).execute();
    await trx
      .insertInto("event_translation")
      .values(
        Object.entries(translations).map(([locale, tr]) => ({
          eventId: id,
          locale,
          name: (tr as any).name,
          city: (tr as any).city ?? null,
          country: (tr as any).country ?? null,
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
