import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tipotesis", async (c) => {
  try {
    const rows = await db.selectFrom("tipotesis").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipotesis-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipotesis")
      .select(["idTipoTesis", (eb) => eb.ref("nombreEN").as("nombre")])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipotesis/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipotesis")
      .selectAll()
      .where("idTipoTesis", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipotesis-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tipotesis")
      .select(["idTipoTesis", (eb) => eb.ref("nombreEN").as("nombre")])
      .where("idTipoTesis", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tipotesis", async (c) => {
  try {
    const tipotesis = await c.req.json();
    const rows = await db
      .selectFrom("tipotesis")
      .selectAll()
      .where("nombre", "like", "%" + tipotesis.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tipotesis-en", async (c) => {
  try {
    const tipotesis = await c.req.json();
    const rows = await db
      .selectFrom("tipotesis")
      .select(["idTipoTesis", (eb) => eb.ref("nombreEN").as("nombre")])
      .where("nombreEN", "like", "%" + tipotesis.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tipotesis", async (c) => {
  try {
    const tipotesis = await c.req.json();
    await db
      .insertInto("tipotesis")
      .values({
        nombre: tipotesis.nombre,
        fechaCreacion: tipotesis.fechaCreacion,
        fechaActualizacion: tipotesis.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El tipotesis ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tipotesis/:id", async (c) => {
  try {
    await db
      .deleteFrom("tipotesis")
      .where("idTipoTesis", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "El tipotesis ha sido eliminada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tipotesis", async (c) => {
  try {
    const tipotesis = await c.req.json();
    await db
      .updateTable("tipotesis")
      .set({
        nombre: tipotesis.nombre,
        fechaCreacion: tipotesis.fechaCreacion,
        fechaActualizacion: tipotesis.fechaActualizacion,
      })
      .where("idTipoTesis", "=", tipotesis.idTipoTesis)
      .execute();
    return c.json({ message: "El tipotesis ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
