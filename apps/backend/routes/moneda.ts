import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-moneda", async (c) => {
  try {
    const rows = await db.selectFrom("moneda").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-moneda/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("moneda")
      .selectAll()
      .where("idMoneda", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
