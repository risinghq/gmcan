import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";

import { db } from "../../db/client.js";
import { IdParam, SearchByTipoBody, SearchGlobalBody } from "./schema.js";

export function registerPublicacionReadRoutes(router: Hono): void {
  router.get("/get-publicacion", async (c) => {
    const rows = await db.selectFrom("publicacion").selectAll().execute();
    return c.json(rows);
  });

  router.get("/get-publicacion/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db.selectFrom("publicacion").selectAll().where("idPublicacion", "=", id).execute();
    return c.json(rows);
  });

  router.get("/get-publicaciones/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("tipoPublicacion_idTipoPublicacion", "=", id)
      .execute();
    return c.json(rows);
  });

  router.get("/get-publicacionesciudad/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db.selectFrom("publicacion").selectAll().where("evento_idEvento", "=", id).execute();
    return c.json(rows);
  });

  router.get("/get-publicacionesevento/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db.selectFrom("publicacion").selectAll().where("evento_idEvento", "=", id).execute();
    return c.json(rows);
  });

  router.get("/get-publicacionesuniversidad/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db.selectFrom("publicacion").selectAll().where("universidad_idUniversidad", "=", id).execute();
    return c.json(rows);
  });

  router.get("/get-publicacionesrevista/:id", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db.selectFrom("publicacion").selectAll().where("revista_idRevista", "=", id).execute();
    return c.json(rows);
  });

  router.post("/search-publicaciones", zValidator("json", SearchByTipoBody), async (c) => {
    const { titulo, tipoPublicacion_idTipoPublicacion } = c.req.valid("json");
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("titulo", "like", `%${titulo}%`)
      .where("tipoPublicacion_idTipoPublicacion", "=", tipoPublicacion_idTipoPublicacion)
      .execute();
    return c.json(rows);
  });

  router.post("/search-publicaciones-global", zValidator("json", SearchGlobalBody), async (c) => {
    const { titulo } = c.req.valid("json");
    const term = `%${titulo}%`;
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("titulo", "like", term),
          eb("fechaPublicacion", "like", term),
          eb("resumen", "like", term),
          eb("resumenEN", "like", term),
        ]),
      )
      .execute();
    return c.json(rows);
  });
}