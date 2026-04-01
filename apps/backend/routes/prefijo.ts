import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-prefijo", async (c) => {
  try {
    const rows = await db.selectFrom("prefijo").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-prefijo", checkToken, async (c) => {
  try {
    const prefijo = await c.req.json();
    await db
      .insertInto("prefijo")
      .values({
        nombre: prefijo.nombre,
        fechaCreacion: prefijo.fechaCreacion,
        fechaActualizacion: prefijo.fechaActualizacion,
      })
      .execute();
    return c.json({ message: "El prefijo ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-prefijo/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("prefijo")
      .where("idPrefijo", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado prefijo" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-prefijo", checkToken, async (c) => {
  try {
    const prefijo = await c.req.json();
    await db
      .updateTable("prefijo")
      .set({
        nombre: prefijo.nombre,
        fechaCreacion: prefijo.fechaCreacion,
        fechaActualizacion: prefijo.fechaActualizacion,
      })
      .where("idPrefijo", "=", Number(prefijo.idPrefijo))
      .execute();
    return c.json({ message: "El prefijo ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
