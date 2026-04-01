import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-usuariohasproyecto", async (c) => {
  try {
    const rows = await db.selectFrom("usuario_has_proyecto").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuariohasproyecto/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario_has_proyecto")
      .selectAll()
      .where("proyecto_idProyecto", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuariohasproyectos/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario_has_proyecto")
      .selectAll()
      .where("usuario_DNI", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-usuariohasproyecto", checkToken, async (c) => {
  try {
    const usuariohasproyecto = await c.req.json();
    await db
      .insertInto("usuario_has_proyecto")
      .values({
        proyecto_idProyecto: usuariohasproyecto.proyecto_idProyecto,
        usuario_DNI: usuariohasproyecto.usuario_DNI,
      })
      .execute();
    return c.json({ status: 1, message: "El usuariohasproyecto ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-usuariohasproyecto/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("usuario_has_proyecto")
      .where("proyecto_idProyecto", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
