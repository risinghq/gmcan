import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  descripcionEN: z.string().optional(),
  moreInfo: z.string().optional(),
  grupo_idGrupo: z.number().int(),
});
const UpdateBody = Body.extend({ idSoftware: z.number().int() });

router.get("/get-software", async (c) => {
  const rows = await db.selectFrom("software").selectAll().execute();
  return c.json(rows);
});

router.get("/get-software/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("software").selectAll().where("idSoftware", "=", id).execute();
  return c.json(rows);
});

router.post("/post-software", checkSession, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("software").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-software/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("software").where("idSoftware", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-software", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idSoftware, ...fields } = c.req.valid("json");
  await db.updateTable("software").set(fields).where("idSoftware", "=", idSoftware).execute();
  return c.json({ status: 1 });
});

export default router;
