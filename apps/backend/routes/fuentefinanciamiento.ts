import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-fuentefinanciamiento", async (c) => {
  try {
    const rows = await db.selectFrom("fuentefinanciamiento").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-fuentefinanciamiento/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("fuentefinanciamiento")
      .selectAll()
      .where("idFuenteFinanciamiento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-fuentefinanciamiento", async (c) => {
  try {
    const fuentefinanciamiento = await c.req.json();
    await db.insertInto("fuentefinanciamiento").values({ nombre: fuentefinanciamiento.nombre }).execute();
    return c.json({ status: 1, message: "La fuente ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-fuentefinanciamiento/:id", async (c) => {
  try {
    await db
      .deleteFrom("fuentefinanciamiento")
      .where("idFuenteFinanciamiento", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Eliminado tipo de noticia" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-fuentefinanciamiento", async (c) => {
  try {
    const fuentefinanciamiento = await c.req.json();
    await db
      .updateTable("fuentefinanciamiento")
      .set({ nombre: fuentefinanciamiento.nombre })
      .where("idFuenteFinanciamiento", "=", Number(fuentefinanciamiento.idFuenteFinanciamiento))
      .execute();
    return c.json({ status: 1, message: "La fuentefinanciamiento ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
