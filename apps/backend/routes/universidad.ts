import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-universidad", async (c) => {
  try {
    const rows = await db.selectFrom("universidad").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-universidad/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("universidad")
      .selectAll()
      .where("idUniversidad", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-universidad", async (c) => {
  try {
    const body = await c.req.json();
    const term = "%" + body.nombre + "%";
    const rows = await db
      .selectFrom("universidad")
      .selectAll()
      .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-universidad", checkToken, async (c) => {
  try {
    const universidad = await c.req.json();
    const result = await db
      .insertInto("universidad")
      .values({ nombre: universidad.nombre, nombreEN: universidad.nombreEN })
      .executeTakeFirst();
    return c.json({ idUniversidad: Number(result.insertId), message: "La universidad ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-universidad/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("universidad")
      .where("idUniversidad", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminada universidad" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-universidad", checkToken, async (c) => {
  try {
    const universidad = await c.req.json();
    await db
      .updateTable("universidad")
      .set({ nombre: universidad.nombre, nombreEN: universidad.nombreEN })
      .where("idUniversidad", "=", Number(universidad.idUniversidad))
      .execute();
    return c.json({ message: "La universidad ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
