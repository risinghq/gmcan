import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tiponoticia", async (c) => {
  try {
    const rows = await db.selectFrom("tiponoticia").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tiponoticia-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("tiponoticia")
      .select(["idtipoNoticia", (eb) => eb.ref("nombreEN").as("nombre")])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tiponoticia/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tiponoticia")
      .selectAll()
      .where("idtipoNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tiponoticia-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("tiponoticia")
      .select(["idtipoNoticia", (eb) => eb.ref("nombreEN").as("nombre")])
      .where("idtipoNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tiponoticia-global", async (c) => {
  try {
    const tiponoticia = await c.req.json();
    const rows = await db
      .selectFrom("tiponoticia")
      .selectAll()
      .where("nombre", "like", "%" + tiponoticia.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-tiponoticia-global-en", async (c) => {
  try {
    const tiponoticia = await c.req.json();
    const rows = await db
      .selectFrom("tiponoticia")
      .selectAll()
      .where("nombreEN", "like", "%" + tiponoticia.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tiponoticia", checkToken, async (c) => {
  try {
    const tiponoticia = await c.req.json();
    await db
      .insertInto("tiponoticia")
      .values({
        nombre: tiponoticia.nombre,
        nombreEN: tiponoticia.nombreEN,
      })
      .execute();
    return c.json({ status: 1, message: "La tipo tiponoticia ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tiponoticia/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("tiponoticia")
      .where("idtipoNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Eliminado tipo de tiponoticia" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tiponoticia", checkToken, async (c) => {
  try {
    const tiponoticia = await c.req.json();
    await db
      .updateTable("tiponoticia")
      .set({
        nombre: tiponoticia.nombre,
        nombreEN: tiponoticia.nombreEN,
      })
      .where("idtipoNoticia", "=", Number(tiponoticia.idtipoNoticia))
      .execute();
    return c.json({ status: 1, message: "La tiponoticia ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
