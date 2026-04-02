import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1) });
const UpdateBody = z.object({ idGenero: z.number().int(), nombre: z.string().min(1) });

router.get("/get-genero", async (c) => {
  const rows = await db.selectFrom("genero").selectAll().execute();
  return c.json(rows);
});

router.get("/get-genero/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("genero").selectAll().where("idGenero", "=", id).execute();
  return c.json(rows);
});

router.post("/post-genero", checkToken, zValidator("json", Body), async (c) => {
  const { nombre } = c.req.valid("json");
  const result = await db.insertInto("genero").values({ nombre }).executeTakeFirst();
  return c.json({ idGenero: Number(result.insertId) }, 201);
});

router.delete("/delete-genero/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("genero").where("idGenero", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-genero", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idGenero, nombre } = c.req.valid("json");
  await db.updateTable("genero").set({ nombre }).where("idGenero", "=", idGenero).execute();
  return c.json({ status: 1 });
});

export default router;
