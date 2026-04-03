import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1) });
const UpdateBody = z.object({ idRevista: z.number().int(), nombre: z.string().min(1) });
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-revista", async (c) => {
  const rows = await db.selectFrom("revista").selectAll().execute();
  return c.json(rows);
});

router.get("/get-revista/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("revista").selectAll().where("idRevista", "=", id).execute();
  return c.json(rows);
});

router.post("/search-revistas", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const rows = await db.selectFrom("revista").selectAll().where("nombre", "like", `%${nombre}%`).execute();
  return c.json(rows);
});

router.post("/post-revista", checkSession, zValidator("json", Body), async (c) => {
  const { nombre } = c.req.valid("json");
  const result = await db.insertInto("revista").values({ nombre }).executeTakeFirst();
  return c.json({ idRevista: Number(result.insertId) }, 201);
});

router.delete("/delete-revista/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("revista").where("idRevista", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-revista", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idRevista, nombre } = c.req.valid("json");
  await db.updateTable("revista").set({ nombre }).where("idRevista", "=", idRevista).execute();
  return c.json({ status: 1 });
});

export default router;
