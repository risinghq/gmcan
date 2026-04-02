import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1), nombreEN: z.string().min(1) });
const UpdateBody = z.object({
  idtipoNoticia: z.number().int(),
  nombre: z.string().min(1),
  nombreEN: z.string().min(1),
});
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-tiponoticia", async (c) => {
  const rows = await db.selectFrom("tiponoticia").selectAll().execute();
  return c.json(rows);
});

router.get("/get-tiponoticia/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("tiponoticia").selectAll().where("idtipoNoticia", "=", id).execute();
  return c.json(rows);
});

router.post("/search-tiponoticia-global", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("tiponoticia")
    .selectAll()
    .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
    .execute();
  return c.json(rows);
});

router.post("/post-tiponoticia", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("tiponoticia").values(body).executeTakeFirst();
  return c.json({ idtipoNoticia: Number(result.insertId) }, 201);
});

router.delete("/delete-tiponoticia/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tiponoticia").where("idtipoNoticia", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tiponoticia", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idtipoNoticia, ...fields } = c.req.valid("json");
  await db.updateTable("tiponoticia").set(fields).where("idtipoNoticia", "=", idtipoNoticia).execute();
  return c.json({ status: 1 });
});

export default router;
