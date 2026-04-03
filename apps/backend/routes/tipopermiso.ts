import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1) });
const UpdateBody = z.object({ idTipoPermiso: z.number().int(), nombre: z.string().min(1) });

router.get("/get-tipopermiso", checkSession, async (c) => {
  const rows = await db.selectFrom("tipopermiso").selectAll().execute();
  return c.json(rows);
});

router.get("/get-tipopermiso/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("tipopermiso").selectAll().where("idTipoPermiso", "=", id).execute();
  return c.json(rows);
});

router.post("/post-tipopermiso", checkSession, zValidator("json", Body), async (c) => {
  const { nombre } = c.req.valid("json");
  const result = await db.insertInto("tipopermiso").values({ nombre }).executeTakeFirst();
  return c.json({ idTipoPermiso: Number(result.insertId) }, 201);
});

router.delete("/delete-tipopermiso/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("tipopermiso").where("idTipoPermiso", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-tipopermiso", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idTipoPermiso, nombre } = c.req.valid("json");
  await db.updateTable("tipopermiso").set({ nombre }).where("idTipoPermiso", "=", idTipoPermiso).execute();
  return c.json({ status: 1 });
});

export default router;
