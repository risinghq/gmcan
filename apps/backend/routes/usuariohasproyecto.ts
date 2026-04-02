import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const DniParam = z.object({ id: z.string().min(1) });
const Body = z.object({ proyecto_idProyecto: z.number().int(), usuario_DNI: z.string().min(1) });

router.get("/get-usuariohasproyecto", async (c) => {
  const rows = await db.selectFrom("usuario_has_proyecto").selectAll().execute();
  return c.json(rows);
});

router.get("/get-usuariohasproyecto/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("usuario_has_proyecto").selectAll().where("proyecto_idProyecto", "=", id).execute();
  return c.json(rows);
});

router.get("/get-usuariohasproyectos/:id", zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("usuario_has_proyecto").selectAll().where("usuario_DNI", "=", id).execute();
  return c.json(rows);
});

router.post("/post-usuariohasproyecto", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("usuario_has_proyecto").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-usuariohasproyecto/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("usuario_has_proyecto").where("proyecto_idProyecto", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
