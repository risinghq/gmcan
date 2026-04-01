import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-usuariohaspermiso", checkToken, async (c) => {
  try {
    const rows = await db.selectFrom("usuariohaspermiso").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuariohaspermiso/:id", checkToken, async (c) => {
  try {
    const rows = await db
      .selectFrom("usuariohaspermiso")
      .selectAll()
      .where("usuario_DNI", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-usuariohaspermiso", checkToken, async (c) => {
  try {
    const usuariohaspermiso = await c.req.json();
    await db
      .insertInto("usuariohaspermiso")
      .values({
        usuario_DNI: usuariohaspermiso.usuario_DNI,
        permiso_idPermiso: usuariohaspermiso.permiso_idPermiso,
      })
      .execute();
    return c.json({ message: "El usuariohaspermiso ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-usuariohaspermiso/:id", checkToken, async (c) => {
  try {
    await db.deleteFrom("usuariohaspermiso").where("usuario_DNI", "=", c.req.param("id")).execute();
    return c.json({ status: 1 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
