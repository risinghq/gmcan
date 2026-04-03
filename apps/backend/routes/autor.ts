import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1) });
const UpdateBody = z.object({
  idautor: z.number().int(),
  nombre: z.string().min(1),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-autor", async (c) => {
  const rows = await db.selectFrom("autor").selectAll().execute();
  return c.json(rows);
});

router.get("/get-autor/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("autor").selectAll().where("idAutor", "=", id).execute();
  return c.json(rows);
});

router.post("/search-autores", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const rows = await db.selectFrom("autor").selectAll().where("nombre", "like", `%${nombre}%`).execute();
  return c.json(rows);
});

router.post("/post-autor", checkSession, zValidator("json", Body), async (c) => {
  const { nombre } = c.req.valid("json");
  const result = await db.insertInto("autor").values({ nombre }).executeTakeFirst();
  return c.json({ idAutor: Number(result.insertId) }, 201);
});

router.delete("/delete-autor/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("autor").where("idAutor", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-autor", zValidator("json", UpdateBody), async (c) => {
  const { idautor, ...fields } = c.req.valid("json");
  await db.updateTable("autor").set(fields).where("idAutor", "=", idautor).execute();
  return c.json({ status: 1 });
});

export default router;
