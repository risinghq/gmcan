import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tipopublicacion", async (c) => {
  try {
    const rows = await db.selectFrom("tipopublicacion").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipopublicacion-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipopublicacion")
      .select(["idTipoPublicacion", (eb) => eb.ref("nombreEN").as("nombre")])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipopublicacion/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipopublicacion")
      .selectAll()
      .where("idTipoPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipopublicacion-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipopublicacion")
      .select(["idTipoPublicacion", (eb) => eb.ref("nombreEN").as("nombre")])
      .where("idTipoPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tipopublicacion", async (c) => {
  try {
    const body = await c.req.json();
    const rows = await db
      .selectFrom("tipopublicacion")
      .selectAll()
      .where("nombre", "like", "%" + body.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tipopublicacion-en", async (c) => {
  try {
    const body = await c.req.json();
    const rows = await db
      .selectFrom("tipopublicacion")
      .select(["idTipoPublicacion", (eb) => eb.ref("nombreEN").as("nombre")])
      .where("nombreEN", "like", "%" + body.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tipopublicacion", async (c) => {
  try {
    const tipopublicacion = await c.req.json();
    await db
      .insertInto("tipopublicacion")
      .values({
        nombre: tipopublicacion.nombre,
        fechaCreacion: tipopublicacion.fechaCreacion,
        fechaActualizacion: tipopublicacion.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El tipopublicacion ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tipopublicacion/:id", async (c) => {
  try {
    await db
      .deleteFrom("tipopublicacion")
      .where("idTipoPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "El tipopublicacion ha sido eliminada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tipopublicacion", async (c) => {
  try {
    const tipopublicacion = await c.req.json();
    await db
      .updateTable("tipopublicacion")
      .set({
        nombre: tipopublicacion.nombre,
        fechaCreacion: tipopublicacion.fechaCreacion,
        fechaActualizacion: tipopublicacion.fechaActualizacion,
      })
      .where("idTipoPublicacion", "=", tipopublicacion.idTipoPublicacion)
      .execute();
    return c.json({ message: "El tipopublicacion ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
