import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const UpdateBody = z.object({
  idPrefijo: z.number().int(),
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});

router.get("/get-prefijo", async (c) => {
  const rows = await db.selectFrom("prefijo").selectAll().execute();
  return c.json(rows);
});

router.post("/post-prefijo", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("prefijo").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-prefijo/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("prefijo").where("idPrefijo", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-prefijo", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idPrefijo, ...fields } = c.req.valid("json");
  await db.updateTable("prefijo").set(fields).where("idPrefijo", "=", idPrefijo).execute();
  return c.json({ status: 1 });
});

export default router;
