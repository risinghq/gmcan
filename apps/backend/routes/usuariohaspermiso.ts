import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const DniParam = z.object({ id: z.string().min(1) });
const Body = z.object({ usuario_DNI: z.string().min(1), permiso_idPermiso: z.number().int() });

router.get("/get-usuariohaspermiso", checkToken, async (c) => {
  const rows = await db.selectFrom("usuariohaspermiso").selectAll().execute();
  return c.json(rows);
});

router.get("/get-usuariohaspermiso/:id", checkToken, zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("usuariohaspermiso").selectAll().where("usuario_DNI", "=", id).execute();
  return c.json(rows);
});

router.post("/post-usuariohaspermiso", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("usuariohaspermiso").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-usuariohaspermiso/:id", checkToken, zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("usuariohaspermiso").where("usuario_DNI", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
