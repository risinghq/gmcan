import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().optional(), nombreEN: z.string().optional() });
const UpdateBody = z.object({
  idUniversidad: z.number().int(),
  nombre: z.string().optional(),
  nombreEN: z.string().optional(),
});
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-universidad", async (c) => {
  const rows = await db.selectFrom("universidad").selectAll().execute();
  return c.json(rows);
});

router.get("/get-universidad/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("universidad").selectAll().where("idUniversidad", "=", id).execute();
  return c.json(rows);
});

router.post("/search-universidad", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("universidad")
    .selectAll()
    .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
    .execute();
  return c.json(rows);
});

router.post("/post-universidad", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("universidad").values(body).executeTakeFirst();
  return c.json({ idUniversidad: Number(result.insertId) }, 201);
});

router.delete("/delete-universidad/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("universidad").where("idUniversidad", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-universidad", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idUniversidad, ...fields } = c.req.valid("json");
  await db.updateTable("universidad").set(fields).where("idUniversidad", "=", idUniversidad).execute();
  return c.json({ status: 1 });
});

export default router;
