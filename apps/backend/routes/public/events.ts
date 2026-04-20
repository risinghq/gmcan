import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const rows = await db.selectFrom("event").selectAll().execute();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

export default router;
