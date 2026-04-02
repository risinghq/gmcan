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
  idTipoTesis: z.number().int(),
  nombre: z.string().min(1),
  nombreEN: z.string().optional(),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-tipotesis", async (c) => {
  const rows = await db.selectFrom("tipotesis").selectAll().execute();
  return c.json(rows);
});

router.get("/get-tipotesis/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("tipotesis").selectAll().where("idTipoTesis", "=", id).execute();
  return c.json(rows);
});

router.post("/search-tipotesis", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("tipotesis")
    .selectAll()
    .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
    .execute();
  return c.json(rows);
});

router.post("/post-tipotesis", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db
    .insertInto("tipotesis")
    .values(body as any)
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-tipotesis/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tipotesis").where("idTipoTesis", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tipotesis", zValidator("json", UpdateBody), async (c) => {
  const { idTipoTesis, ...fields } = c.req.valid("json");
  await db
    .updateTable("tipotesis")
    .set(fields as any)
    .where("idTipoTesis", "=", idTipoTesis)
    .execute();
  return c.json({ status: 1 });
});

export default router;
