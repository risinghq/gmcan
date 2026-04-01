import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-software", async (c) => {
  try {
    const rows = await db.selectFrom("software").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-software-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("software")
      .select([
        "idSoftware",
        "nombre",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "moreInfo",
        "fechaActualizacion",
        "grupo_idGrupo",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-software/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("software")
      .selectAll()
      .where("idSoftware", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-software-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("software")
      .select([
        "idSoftware",
        "nombre",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "moreInfo",
        "fechaActualizacion",
        "grupo_idGrupo",
      ])
      .where("idSoftware", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-software", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    await db
      .insertInto("software")
      .values({
        nombre: not.nombre,
        descripcion: not.descripcion,
        descripcionEN: not.descripcionEN,
        moreInfo: not.moreInfo,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .execute();
    return c.json({ status: 1, message: "La software ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-software/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("software")
      .where("idSoftware", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "La software ha sido eliminada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-software", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    await db
      .updateTable("software")
      .set({
        nombre: not.nombre,
        descripcion: not.descripcion,
        descripcionEN: not.descripcionEN,
        moreInfo: not.moreInfo,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .where("idSoftware", "=", Number(not.idSoftware))
      .execute();
    return c.json({ status: 1, message: "La software ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
