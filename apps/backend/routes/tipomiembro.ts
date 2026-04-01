import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tipomiembro", async (c) => {
  try {
    const rows = await db.selectFrom("tipomiembro").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipomiembro-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipomiembro")
      .select([
        "idTipoMiembro",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("nombreSingularEN").as("nombreSingular"),
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tipomiembro", async (c) => {
  try {
    const tipomiembro = await c.req.json();
    await db
      .insertInto("tipomiembro")
      .values({
        nombre: tipomiembro.nombre,
        fechaCreacion: tipomiembro.fechaCreacion,
        fechaActualizacion: tipomiembro.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El tipomiembro ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tipomiembro/:id", async (c) => {
  try {
    await db
      .deleteFrom("tipomiembro")
      .where("idTipoMiembro", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado tipomiembro" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tipomiembro", async (c) => {
  try {
    const tipomiembro = await c.req.json();
    await db
      .updateTable("tipomiembro")
      .set({
        nombre: tipomiembro.nombre,
        fechaCreacion: tipomiembro.fechaCreacion,
        fechaActualizacion: tipomiembro.fechaActualizacion,
      })
      .where("idTipoMiembro", "=", Number(tipomiembro.idTipoMiembro))
      .execute();
    return c.json({ message: "El tipomiembro ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
