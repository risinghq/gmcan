import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const SearchBody = z.object({ autores_idAutor: z.number().int() });
const Body = z.object({
  autor_idAutor: z.number().int(),
  publicacion_idPublicacion: z.number().int(),
  isPrincipal: z.number().int(),
});

router.get("/get-publicacionhasautor", async (c) => {
  const rows = await db.selectFrom("publicacion_has_autor").selectAll().execute();
  return c.json(rows);
});

router.get("/get-publicacionhasautor/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("publicacion_has_autor")
    .selectAll()
    .where("publicacion_idPublicacion", "=", id)
    .execute();
  return c.json(rows);
});

router.post("/search-publicacionhasautor", zValidator("json", SearchBody), async (c) => {
  const { autores_idAutor } = c.req.valid("json");
  const rows = await db
    .selectFrom("publicacion_has_autor")
    .selectAll()
    .where("autores_idAutor", "=", autores_idAutor)
    .execute();
  return c.json(rows);
});

router.post("/post-publicacionhasautor", checkToken, zValidator("json", Body), async (c) => {
  const { autor_idAutor, publicacion_idPublicacion, isPrincipal } = c.req.valid("json");
  await db
    .insertInto("publicacion_has_autor")
    .values({ autores_idAutor: autor_idAutor, publicacion_idPublicacion, isPrincipal })
    .execute();
  return c.json({ status: 1 }, 201);
});

router.delete("/delete-publicacionhasautor/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("publicacion_has_autor").where("publicacion_idPublicacion", "=", id).execute();
  return c.json({ status: 1 });
});

export default router;
