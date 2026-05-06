import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const PlainNameBody = z.object({ name: z.string().min(1) });
const CurrencyBody = z.object({ symbol: z.string().min(1) });

router.get("/gender", async (c) => c.json(await db.selectFrom("gender").selectAll().execute()));
router.get("/gender/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("gender").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/gender", zValidator("json", PlainNameBody), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("gender").values(body).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/gender/:id", zValidator("param", IdParam), zValidator("json", PlainNameBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("gender").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/gender/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("gender").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/prefix", async (c) => c.json(await db.selectFrom("prefix").selectAll().execute()));
router.get("/prefix/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("prefix").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/prefix", zValidator("json", PlainNameBody), async (c) => {
  const result = await db.insertInto("prefix").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/prefix/:id", zValidator("param", IdParam), zValidator("json", PlainNameBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("prefix").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/prefix/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("prefix").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/role", async (c) => c.json(await db.selectFrom("role").selectAll().execute()));
router.get("/role/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("role").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/role", zValidator("json", PlainNameBody), async (c) => {
  const result = await db.insertInto("role").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/role/:id", zValidator("param", IdParam), zValidator("json", PlainNameBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("role").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/role/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("role").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/journal", async (c) => c.json(await db.selectFrom("journal").selectAll().execute()));
router.get("/journal/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("journal").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/journal", zValidator("json", PlainNameBody), async (c) => {
  const result = await db.insertInto("journal").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/journal/:id", zValidator("param", IdParam), zValidator("json", PlainNameBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("journal").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/journal/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("journal").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/funding-source", async (c) => c.json(await db.selectFrom("funding_source").selectAll().execute()));
router.get("/funding-source/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("funding_source").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/funding-source", zValidator("json", PlainNameBody), async (c) => {
  const result = await db.insertInto("funding_source").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/funding-source/:id", zValidator("param", IdParam), zValidator("json", PlainNameBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("funding_source").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/funding-source/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("funding_source").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/currency", async (c) => c.json(await db.selectFrom("currency").selectAll().execute()));
router.get("/currency/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("currency").selectAll().where("id", "=", id).executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});
router.post("/currency", zValidator("json", CurrencyBody), async (c) => {
  const result = await db.insertInto("currency").values(c.req.valid("json")).executeTakeFirstOrThrow();
  return c.json({ id: Number(result.insertId) }, 201);
});
router.put("/currency/:id", zValidator("param", IdParam), zValidator("json", CurrencyBody), async (c) => {
  const { id } = c.req.valid("param");
  await db.updateTable("currency").set(c.req.valid("json")).where("id", "=", id).execute();
  return c.json({ status: 1 });
});
router.delete("/currency/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("currency").where("id", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
