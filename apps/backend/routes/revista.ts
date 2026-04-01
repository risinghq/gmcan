import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-revista", async (c) => {
  try {
    const rows = await db.selectFrom("revista").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-revista/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("revista")
      .selectAll()
      .where("idRevista", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-revistas", async (c) => {
  try {
    const revista = await c.req.json();
    const rows = await db
      .selectFrom("revista")
      .selectAll()
      .where("nombre", "like", "%" + revista.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-revista", checkToken, async (c) => {
  try {
    const revista = await c.req.json();
    await db.insertInto("revista").values({ nombre: revista.nombre }).execute();
    return c.json({ status: 1, message: "La revista ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-revista/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("revista")
      .where("idRevista", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Eliminado revista" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-revista", checkToken, async (c) => {
  try {
    const revista = await c.req.json();
    await db
      .updateTable("revista")
      .set({ nombre: revista.nombre })
      .where("idRevista", "=", Number(revista.idRevista))
      .execute();
    return c.json({ status: 1, message: "La revista ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
