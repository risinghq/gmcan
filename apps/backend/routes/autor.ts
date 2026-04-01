import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-autor", async (c) => {
  try {
    const rows = await db.selectFrom("autor").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-autor/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("autor")
      .selectAll()
      .where("idAutor", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-autores", async (c) => {
  try {
    const autor = await c.req.json();
    const rows = await db
      .selectFrom("autor")
      .selectAll()
      .where("nombre", "like", "%" + autor.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-autor", checkToken, async (c) => {
  try {
    const autor = await c.req.json();
    const result = await db.insertInto("autor").values({ nombre: autor.nombre }).executeTakeFirst();
    return c.json({ idAutor: Number(result.insertId), message: "El autor ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-autor/:id", async (c) => {
  try {
    await db
      .deleteFrom("autor")
      .where("idAutor", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ message: "Eliminado autor" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-autor", async (c) => {
  try {
    const autor = await c.req.json();
    await db
      .updateTable("autor")
      .set({
        nombre: autor.nombre,
        fechaCreacion: autor.fechaCreacion,
        fechaActualizacion: autor.fechaActualizacion,
      })
      .where("idAutor", "=", Number(autor.idautor))
      .execute();
    return c.json({ message: "El autor ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
