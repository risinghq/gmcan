import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-publicacionhasusuario", async (c) => {
  try {
    const rows = await db.selectFrom("publicacion_has_usuario").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionhasusuario/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion_has_usuario")
      .selectAll()
      .where("publicacion_idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-publicacionhasusuario", async (c) => {
  try {
    const publicacionhasusuario = await c.req.json();
    const rows = await db
      .selectFrom("publicacion_has_usuario")
      .selectAll()
      .where("usuario_DNI", "=", publicacionhasusuario.usuario_DNI)
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-publicacionhasusuario", checkToken, async (c) => {
  try {
    const publicacionhasusuario = await c.req.json();
    await db
      .insertInto("publicacion_has_usuario")
      .values({
        usuario_DNI: publicacionhasusuario.usuario_DNI,
        publicacion_idPublicacion: publicacionhasusuario.publicacion_idPublicacion,
        isPrincipal: publicacionhasusuario.isPrincipal,
      })
      .execute();
    return c.json({ message: "El publicacion_has_usuario ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-publicacionhasusuario/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("publicacion_has_usuario")
      .where("publicacion_idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Borrado exitosamente" });
  } catch (err) {
    console.log(err);
    return c.json({ status: 1, message: "La publicacion no existe" }, 500);
  }
});

router.put("/update-publicacionhasusuario", checkToken, async (c) => {
  try {
    const publicacionhasusuario = await c.req.json();
    await db
      .updateTable("publicacion_has_usuario")
      .set({
        usuario_DNI: publicacionhasusuario.usuario_DNI,
        publicacion_idPublicacion: publicacionhasusuario.publicacion_idPublicacion,
        fechaCreacion: publicacionhasusuario.fechaCreacion,
        fechaActualizacion: publicacionhasusuario.fechaActualizacion,
        isPrincipal: publicacionhasusuario.isPrincipal,
      })
      .where("usuario_DNI", "=", publicacionhasusuario.usuario_DNI)
      .where("publicacion_idPublicacion", "=", Number(publicacionhasusuario.publicacion_idPublicacion))
      .execute();
    return c.json({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
