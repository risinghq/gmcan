import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-usuariohasgrupo", async (c) => {
  try {
    const rows = await db.selectFrom("usuario_has_grupo").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-usuariohasgrupo", async (c) => {
  try {
    const usuariohasgrupo = await c.req.json();
    await db
      .insertInto("usuario_has_grupo")
      .values({
        usuario_DNI: usuariohasgrupo.usuario_DNI,
        grupo_idGrupo: usuariohasgrupo.grupo_idGrupo,
        fechaCreacion: usuariohasgrupo.fechaCreacion,
        fechaActualizacion: usuariohasgrupo.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El usuario_has_grupo ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-usuariohasgrupo", async (c) => {
  try {
    const usuariohasgrupo = await c.req.json();
    await db
      .deleteFrom("usuario_has_grupo")
      .where("usuario_DNI", "=", usuariohasgrupo.usuario_DNI)
      .where("grupo_idGrupo", "=", Number(usuariohasgrupo.grupo_idGrupo))
      .execute();
    return c.json({ status: 1, message: "Borrado exitosamente" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-usuariohasgrupo", async (c) => {
  try {
    const usuariohasgrupo = await c.req.json();
    await db
      .updateTable("usuario_has_grupo")
      .set({
        usuario_DNI: usuariohasgrupo.usuario_DNI,
        grupo_idGrupo: usuariohasgrupo.grupo_idGrupo,
        fechaCreacion: usuariohasgrupo.fechaCreacion,
        fechaActualizacion: usuariohasgrupo.fechaActualizacion,
      })
      .where("usuario_DNI", "=", usuariohasgrupo.usuario_DNI)
      .where("grupo_idGrupo", "=", Number(usuariohasgrupo.grupo_idGrupo))
      .execute();
    return c.json({ message: "El usuario_has_grupo ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
