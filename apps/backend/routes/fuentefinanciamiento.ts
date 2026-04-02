import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ nombre: z.string().min(1) });
const UpdateBody = z.object({ idFuenteFinanciamiento: z.number().int(), nombre: z.string().min(1) });

router.get("/get-fuentefinanciamiento", async (c) => {
  const rows = await db.selectFrom("fuentefinanciamiento").selectAll().execute();
  return c.json(rows);
});

router.get("/get-fuentefinanciamiento/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("fuentefinanciamiento")
    .selectAll()
    .where("idFuenteFinanciamiento", "=", id)
    .execute();
  return c.json(rows);
});

router.post("/post-fuentefinanciamiento", zValidator("json", Body), async (c) => {
  const { nombre } = c.req.valid("json");
  await db.insertInto("fuentefinanciamiento").values({ nombre }).execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-fuentefinanciamiento/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("fuentefinanciamiento").where("idFuenteFinanciamiento", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-fuentefinanciamiento", zValidator("json", UpdateBody), async (c) => {
  const { idFuenteFinanciamiento, nombre } = c.req.valid("json");
  await db
    .updateTable("fuentefinanciamiento")
    .set({ nombre })
    .where("idFuenteFinanciamiento", "=", idFuenteFinanciamiento)
    .execute();
  return c.json({ status: 1 });
});

export default router;
