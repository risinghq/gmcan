import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const UpdateBody = z.object({
  idTipoUsuario: z.number().int(),
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});

router.get("/get-tipousuario", async (c) => {
  const rows = await db.selectFrom("tipousuario").selectAll().execute();
  return c.json(rows);
});

router.post("/post-tipousuario", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("tipousuario").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-tipousuario/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tipousuario").where("idTipoUsuario", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tipousuario", zValidator("json", UpdateBody), async (c) => {
  const { idTipoUsuario, ...fields } = c.req.valid("json");
  await db.updateTable("tipousuario").set(fields).where("idTipoUsuario", "=", idTipoUsuario).execute();
  return c.json({ status: 1 });
});

export default router;
