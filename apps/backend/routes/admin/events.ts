import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const EventBody = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
  country: z.string().optional(),
  cityEN: z.string().optional(),
  countryEN: z.string().optional(),
});

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

router.post("/", zValidator("json", EventBody), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insertInto("event").values(data).executeTakeFirst();
  return c.json({ id: Number(result.insertId) }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", EventBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await db.updateTable("event").set(data).where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("event").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
