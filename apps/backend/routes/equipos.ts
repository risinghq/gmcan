import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  cpu: z.string().optional(),
  gpu: z.string().optional(),
  ram: z.string().optional(),
  hd: z.string().optional(),
  grupo_idGrupo: z.number().int(),
});
const UpdateBody = Body.extend({ idEquipo: z.number().int() });

router.get("/get-equipo", async (c) => {
  const rows = await db.selectFrom("equipo").selectAll().execute();
  return c.json(rows);
});

router.get("/get-equipo/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("equipo").selectAll().where("idEquipo", "=", id).execute();
  return c.json(rows);
});

router.post("/post-equipo", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("equipo").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-equipo/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("equipo").where("idEquipo", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-equipo", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idEquipo, ...fields } = c.req.valid("json");
  await db.updateTable("equipo").set(fields).where("idEquipo", "=", idEquipo).execute();
  return c.json({ status: 1 });
});

export default router;
