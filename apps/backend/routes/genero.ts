import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-genero", async (c) => {
  try {
    const rows = await db.selectFrom("genero").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-genero/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("genero")
      .selectAll()
      .where("idGenero", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-genero", checkToken, async (c) => {
  try {
    const genero = await c.req.json();
    const result = await db.insertInto("genero").values({ nombre: genero.nombre }).executeTakeFirst();
    return c.json({ idGenero: Number(result.insertId), message: "El genero ha sido guardado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-genero/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("genero")
      .where("idGenero", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado genero" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-genero", checkToken, async (c) => {
  try {
    const genero = await c.req.json();
    await db
      .updateTable("genero")
      .set({ nombre: genero.nombre })
      .where("idGenero", "=", Number(genero.idGenero))
      .execute();
    return c.json({ message: "El genero ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
