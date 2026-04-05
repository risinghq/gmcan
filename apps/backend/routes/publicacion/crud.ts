import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";

import { checkSession } from "../../auth/session.js";
import { db } from "../../db/client.js";
import { CreateBody, IdParam, UpdateBody } from "./schema.js";

export function registerPublicacionCrudRoutes(router: Hono): void {
  router.post("/", checkSession, zValidator("json", CreateBody), async (c) => {
    const { data, autores } = c.req.valid("json");
    const idPublicacion = await db.transaction().execute(async (trx) => {
      const result = await trx.insertInto("publicacion").values(data).executeTakeFirstOrThrow();
      const id = Number(result.insertId);
      if (autores.length > 0) {
        await trx
          .insertInto("publicacion_has_autor")
          .values(
            autores.map((a) => ({
              publicacion_idPublicacion: id,
              isPrincipal: a.isPrincipal,
              nombre: a.kind === "external" ? a.nombre : null,
              usuario_DNI: a.kind === "registered" ? a.DNI : null,
            })),
          )
          .execute();
      }
      return id;
    });
    return c.json({ idPublicacion }, 201);
  });

  router.put("/:id", checkSession, zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
    const { id } = c.req.valid("param");
    const { data, autores } = c.req.valid("json");
    await db.transaction().execute(async (trx) => {
      await trx.updateTable("publicacion").set(data).where("idPublicacion", "=", id).execute();
      await trx.deleteFrom("publicacion_has_autor").where("publicacion_idPublicacion", "=", id).execute();
      if (autores.length > 0) {
        await trx
          .insertInto("publicacion_has_autor")
          .values(
            autores.map((a) => ({
              publicacion_idPublicacion: id,
              isPrincipal: a.isPrincipal,
              nombre: a.kind === "external" ? a.nombre : null,
              usuario_DNI: a.kind === "registered" ? a.DNI : null,
            })),
          )
          .execute();
      }
    });
    return c.json({ status: 1 });
  });

  router.delete("/:id", checkSession, zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom("publicacion_has_autor").where("publicacion_idPublicacion", "=", id).execute();
      await trx.deleteFrom("publicacion").where("idPublicacion", "=", id).execute();
    });
    return c.json({ status: 1 });
  });
}
