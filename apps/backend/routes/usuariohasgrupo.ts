import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const Body = z.object({
  usuario_DNI: z.string().min(1),
  grupo_idGrupo: z.number().int(),
  fechaCreacion: z.string().optional(),
  fechaActualizacion: z.string().optional(),
});

router.get("/get-usuariohasgrupo", async (c) => {
  const rows = await db.selectFrom("usuario_has_grupo").selectAll().execute();
  return c.json(rows);
});

router.post("/post-usuariohasgrupo", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  await db
    .insertInto("usuario_has_grupo")
    .values(body as any)
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete(
  "/delete-usuariohasgrupo",
  zValidator("json", z.object({ usuario_DNI: z.string().min(1), grupo_idGrupo: z.number().int() })),
  async (c) => {
    const { usuario_DNI, grupo_idGrupo } = c.req.valid("json");
    await db
      .deleteFrom("usuario_has_grupo")
      .where("usuario_DNI", "=", usuario_DNI)
      .where("grupo_idGrupo", "=", grupo_idGrupo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put("/update-usuariohasgrupo", zValidator("json", Body), async (c) => {
  const { usuario_DNI, grupo_idGrupo, ...fields } = c.req.valid("json");
  await db
    .updateTable("usuario_has_grupo")
    .set(fields as any)
    .where("usuario_DNI", "=", usuario_DNI)
    .where("grupo_idGrupo", "=", grupo_idGrupo)
    .execute();
  return c.json({ status: 1 });
});

export default router;
