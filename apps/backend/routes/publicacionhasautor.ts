import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-publicacionhasautor", async (c) => {
  try {
    const rows = await db.selectFrom("publicacion_has_autor").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionhasautor/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion_has_autor")
      .selectAll()
      .where("publicacion_idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-publicacionhasautor", async (c) => {
  try {
    const publicacionhasautor = await c.req.json();
    const rows = await db
      .selectFrom("publicacion_has_autor")
      .selectAll()
      .where("autores_idAutor", "=", Number(publicacionhasautor.autores_idAutor))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-publicacionhasautor", checkToken, async (c) => {
  try {
    const publicacionhasautor = await c.req.json();
    await db
      .insertInto("publicacion_has_autor")
      .values({
        autores_idAutor: publicacionhasautor.autor_idAutor,
        publicacion_idPublicacion: publicacionhasautor.publicacion_idPublicacion,
        isPrincipal: publicacionhasautor.isPrincipal,
      })
      .execute();
    return c.json({ message: "El publicacion_has_autor ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ status: 1, message: "La publicacion no existe" }, 500);
  }
});

router.delete("/delete-publicacionhasautor/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("publicacion_has_autor")
      .where("publicacion_idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Borrado exitosamente" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
