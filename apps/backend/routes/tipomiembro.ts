import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  nombreEN: z.string().optional(),
  nombreSingular: z.string().optional(),
  nombreSingularEN: z.string().optional(),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});
const UpdateBody = Body.extend({ idTipoMiembro: z.number().int() });

router.get("/get-tipomiembro", async (c) => {
  const rows = await db.selectFrom("tipomiembro").selectAll().execute();
  return c.json(rows);
});

router.post("/post-tipomiembro", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db
    .insertInto("tipomiembro")
    .values(body as any)
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-tipomiembro/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tipomiembro").where("idTipoMiembro", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tipomiembro", zValidator("json", UpdateBody), async (c) => {
  const { idTipoMiembro, ...fields } = c.req.valid("json");
  await db
    .updateTable("tipomiembro")
    .set(fields as any)
    .where("idTipoMiembro", "=", idTipoMiembro)
    .execute();
  return c.json({ status: 1 });
});

export default router;
