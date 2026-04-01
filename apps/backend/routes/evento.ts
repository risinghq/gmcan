import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-evento", async (c) => {
  try {
    const rows = await db.selectFrom("evento").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-evento-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("evento")
      .select(["idEvento", "nombre", (eb) => eb.ref("paisEN").as("pais"), (eb) => eb.ref("ciudadEN").as("ciudad")])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-evento/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("evento")
      .selectAll()
      .where("idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-evento-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("evento")
      .select(["idEvento", "nombre", (eb) => eb.ref("paisEN").as("pais"), (eb) => eb.ref("ciudadEN").as("ciudad")])
      .where("idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-eventos", async (c) => {
  try {
    const evento = await c.req.json();
    const rows = await db
      .selectFrom("evento")
      .selectAll()
      .where("nombre", "like", "%" + evento.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-evento", async (c) => {
  try {
    const evento = await c.req.json();
    await db
      .insertInto("evento")
      .values({
        nombre: evento.nombre,
        ciudad: evento.ciudad,
        ciudadEN: evento.ciudadEN,
        pais: evento.pais,
        paisEN: evento.paisEN,
      })
      .execute();
    return c.json({ status: 1, message: "La tipo noticia ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-evento/:id", async (c) => {
  try {
    await db
      .deleteFrom("evento")
      .where("idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Eliminado tipo de noticia" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-evento", async (c) => {
  try {
    const evento = await c.req.json();
    await db
      .updateTable("evento")
      .set({
        nombre: evento.nombre,
        ciudad: evento.ciudad,
        ciudadEN: evento.ciudadEN,
        pais: evento.pais,
        paisEN: evento.paisEN,
      })
      .where("idEvento", "=", Number(evento.idEvento))
      .execute();
    return c.json({ status: 1, message: "La evento ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
