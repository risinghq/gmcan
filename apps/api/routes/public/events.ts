import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";
import { localizeField } from "../../lib/public-locale.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await db.selectFrom("event").selectAll().execute();
  return c.json(
    rows.map((row) => ({
      id: row.id,
      name: localizeField(row, locale, { es: "name", en: "name" }),
      city: localizeField(row, locale, { es: "city", en: "cityEN", required: false }),
      country: localizeField(row, locale, { es: "country", en: "countryEN", required: false }),
    })),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    name: localizeField(row, locale, { es: "name", en: "name" }),
    city: localizeField(row, locale, { es: "city", en: "cityEN", required: false }),
    country: localizeField(row, locale, { es: "country", en: "countryEN", required: false }),
  });
});

export default router;
