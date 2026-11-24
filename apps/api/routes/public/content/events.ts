import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { getEventLocalized, listEventsLocalized } from "../../../services/event.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const rows = await listEventsLocalized(c.get("locale"));
  return c.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      country: row.country,
    })),
  );
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const row = await getEventLocalized(c.req.valid("param").id, c.get("locale"));
  if (!row) throw notFound();
  return c.json({
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
  });
});

export default router;
