import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const UpdateBody = z.object({
  idPermiso: z.number().int(),
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});

router.get("/get-permiso", async (c) => {
  const rows = await db.selectFrom("permiso").selectAll().execute();
  return c.json(rows);
});

router.post("/post-permiso", checkSession, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db
    .insertInto("permiso")
    .values(body as any)
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-permiso/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("permiso").where("idPermiso", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-permiso", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idPermiso, ...fields } = c.req.valid("json");
  await db
    .updateTable("permiso")
    .set(fields as any)
    .where("idPermiso", "=", idPermiso)
    .execute();
  return c.json({ status: 1 });
});

export default router;
