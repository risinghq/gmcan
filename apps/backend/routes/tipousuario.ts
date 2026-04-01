import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tipousuario", async (c) => {
  try {
    const rows = await db.selectFrom("tipousuario").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tipousuario", async (c) => {
  try {
    const tipouser = await c.req.json();
    await db
      .insertInto("tipousuario")
      .values({
        nombre: tipouser.nombre,
        fechaCreacion: tipouser.fechaCreacion,
        fechaActualizacion: tipouser.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El tipousuario ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tipousuario/:id", async (c) => {
  try {
    await db
      .deleteFrom("tipousuario")
      .where("idTipoUsuario", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado tipousuario" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tipousuario", async (c) => {
  try {
    const tipouser = await c.req.json();
    await db
      .updateTable("tipousuario")
      .set({
        nombre: tipouser.nombre,
        fechaCreacion: tipouser.fechaCreacion,
        fechaActualizacion: tipouser.fechaActualizacion,
      })
      .where("idTipoUsuario", "=", Number(tipouser.idTipoUsuario))
      .execute();
    return c.json({ message: "El tipousuario ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
