import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/get-moneda", async (c) => {
  const rows = await db.selectFrom("moneda").selectAll().execute();
  return c.json(rows);
});

router.get("/get-moneda/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("moneda").selectAll().where("idMoneda", "=", id).execute();
  return c.json(rows);
});

export default router;
