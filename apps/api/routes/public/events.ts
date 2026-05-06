import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

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
    .execute();
  return c.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      country: row.country,
    })),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await db
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
    .where("event.id", "=", id)
    .executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
  });
});

export default router;
