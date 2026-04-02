import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  nombreEN: z.string().optional(),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const UpdateBody = z.object({
  idTipoPublicacion: z.number().int(),
  nombre: z.string().min(1),
  nombreEN: z.string().optional(),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-tipopublicacion", async (c) => {
  const rows = await db.selectFrom("tipopublicacion").selectAll().execute();
  return c.json(rows);
});

router.get("/get-tipopublicacion/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("tipopublicacion").selectAll().where("idTipoPublicacion", "=", id).execute();
  return c.json(rows);
});

router.post("/search-tipopublicacion", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("tipopublicacion")
    .selectAll()
    .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
    .execute();
  return c.json(rows);
});

router.post("/post-tipopublicacion", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db
    .insertInto("tipopublicacion")
    .values(body as any)
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-tipopublicacion/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tipopublicacion").where("idTipoPublicacion", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tipopublicacion", zValidator("json", UpdateBody), async (c) => {
  const { idTipoPublicacion, ...fields } = c.req.valid("json");
  await db
    .updateTable("tipopublicacion")
    .set(fields as any)
    .where("idTipoPublicacion", "=", idTipoPublicacion)
    .execute();
  return c.json({ status: 1 });
});

export default router;
