import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-permiso", async (c) => {
  try {
    const rows = await db.selectFrom("permiso").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-permiso", checkToken, async (c) => {
  try {
    const permiso = await c.req.json();
    await db
      .insertInto("permiso")
      .values({
        nombre: permiso.nombre,
        fechaCreacion: permiso.fechaCreacion,
        fechaActualizacion: permiso.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El permiso ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-permiso/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("permiso")
      .where("idPermiso", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado permiso" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-permiso", checkToken, async (c) => {
  try {
    const permiso = await c.req.json();
    await db
      .updateTable("permiso")
      .set({
        nombre: permiso.nombre,
        fechaCreacion: permiso.fechaCreacion,
        fechaActualizacion: permiso.fechaActualizacion,
      })
      .where("idPermiso", "=", Number(permiso.idPermiso))
      .execute();
    return c.json({ message: "El permiso ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
