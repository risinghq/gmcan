import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  ciudad: z.string().optional(),
  ciudadEN: z.string().optional(),
  pais: z.string().optional(),
  paisEN: z.string().optional(),
});
const UpdateBody = Body.extend({ idEvento: z.number().int() });
const SearchBody = z.object({ nombre: z.string() });

router.get("/get-evento", async (c) => {
  const rows = await db.selectFrom("evento").selectAll().execute();
  return c.json(rows);
});

router.get("/get-evento/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("evento").selectAll().where("idEvento", "=", id).execute();
  return c.json(rows);
});

router.post("/search-eventos", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const rows = await db.selectFrom("evento").selectAll().where("nombre", "like", `%${nombre}%`).execute();
  return c.json(rows);
});

router.post("/post-evento", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("evento").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-evento/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("evento").where("idEvento", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-evento", zValidator("json", UpdateBody), async (c) => {
  const { idEvento, ...fields } = c.req.valid("json");
  await db.updateTable("evento").set(fields).where("idEvento", "=", idEvento).execute();
  return c.json({ status: 1 });
});

export default router;
