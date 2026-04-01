import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-equipo", async (c) => {
  try {
    const rows = await db.selectFrom("equipo").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-equipo/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("equipo")
      .selectAll()
      .where("idEquipo", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-equipo", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    await db
      .insertInto("equipo")
      .values({
        nombre: not.nombre,
        cpu: not.cpu,
        gpu: not.gpu,
        ram: not.ram,
        hd: not.hd,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .execute();
    return c.json({ status: 1, message: "La equipo ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-equipo/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("equipo")
      .where("idEquipo", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "El equipo ha sido eliminado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-equipo", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    await db
      .updateTable("equipo")
      .set({
        nombre: not.nombre,
        cpu: not.cpu,
        gpu: not.gpu,
        ram: not.ram,
        hd: not.hd,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .where("idEquipo", "=", Number(not.idEquipo))
      .execute();
    return c.json({ status: 1, message: "El equipo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
