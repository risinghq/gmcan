import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  usuario_DNI: z.string().min(1),
  publicacion_idPublicacion: z.number().int(),
  isPrincipal: z.number().int(),
});
const UpdateBody = Body.extend({ fechaCreacion: z.string().optional(), fechaActualizacion: z.string().optional() });

router.get("/get-publicacionhasusuario", async (c) => {
  const rows = await db.selectFrom("publicacion_has_usuario").selectAll().execute();
  return c.json(rows);
});

router.get("/get-publicacionhasusuario/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("publicacion_has_usuario")
    .selectAll()
    .where("publicacion_idPublicacion", "=", id)
    .execute();
  return c.json(rows);
});

router.post(
  "/search-publicacionhasusuario",
  zValidator("json", z.object({ usuario_DNI: z.string().min(1) })),
  async (c) => {
    const { usuario_DNI } = c.req.valid("json");
    const rows = await db
      .selectFrom("publicacion_has_usuario")
      .selectAll()
      .where("usuario_DNI", "=", usuario_DNI)
      .execute();
    return c.json(rows);
  },
);

router.post("/post-publicacionhasusuario", checkToken, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db.insertInto("publicacion_has_usuario").values(body).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-publicacionhasusuario/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("publicacion_has_usuario").where("publicacion_idPublicacion", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-publicacionhasusuario", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { usuario_DNI, publicacion_idPublicacion, ...fields } = c.req.valid("json");
  await db
    .updateTable("publicacion_has_usuario")
    .set(fields)
    .where("usuario_DNI", "=", usuario_DNI)
    .where("publicacion_idPublicacion", "=", publicacion_idPublicacion)
    .execute();
  return c.json({ status: 1 });
});

export default router;
