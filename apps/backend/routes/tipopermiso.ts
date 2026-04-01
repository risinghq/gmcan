import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-tipopermiso", checkToken, async (c) => {
  try {
    const rows = await db.selectFrom("tipopermiso").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-tipopermiso/:id", checkToken, async (c) => {
  try {
    const rows = await db
      .selectFrom("tipopermiso")
      .selectAll()
      .where("idTipoPermiso", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-tipopermiso", checkToken, async (c) => {
  try {
    const tipopermiso = await c.req.json();
    const result = await db.insertInto("tipopermiso").values({ nombre: tipopermiso.nombre }).executeTakeFirst();
    return c.json({ idTipoPermiso: Number(result.insertId), message: "El tipo permiso ha sido guardado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-tipopermiso/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("tipopermiso")
      .where("idTipoPermiso", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado tipo permiso" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-tipopermiso", checkToken, async (c) => {
  try {
    const tipopermiso = await c.req.json();
    await db
      .updateTable("tipopermiso")
      .set({ nombre: tipopermiso.nombre })
      .where("idTipoPermiso", "=", Number(tipopermiso.idTipoPermiso))
      .execute();
    return c.json({ message: "El tipo permiso ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
