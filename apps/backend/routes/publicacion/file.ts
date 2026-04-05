import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";

import { checkSession } from "../../auth/session.js";
import { db } from "../../db/client.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../../lib/upload.js";
import { PUBLICACION_FILE_CONFIG } from "./file-config.js";
import { IdParam } from "./schema.js";

export function registerPublicacionFileRoutes(router: Hono): void {
  router.put("/:id/file", checkSession, zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const current = await db
      .selectFrom("publicacion")
      .select("archivo")
      .where("idPublicacion", "=", id)
      .executeTakeFirst();
    if (!current) return c.json({ error: "Not found" }, 404);

    const body = await c.req.parseBody({ all: true });
    const file = extractFirstFile(body);
    if (!file) return c.json({ error: "No file uploaded" }, 400);
    const storedFileName = await saveUploadedFile(file, PUBLICACION_FILE_CONFIG);
    if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

    await db.updateTable("publicacion").set({ archivo: storedFileName }).where("idPublicacion", "=", id).execute();
    if (current.archivo && current.archivo !== storedFileName) {
      await deleteUploadedFile({ directory: PUBLICACION_FILE_CONFIG.directory, fileName: current.archivo });
    }

    return c.json({ status: 1 });
  });

  router.get("/:id/file", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const row = await db.selectFrom("publicacion").select("archivo").where("idPublicacion", "=", id).executeTakeFirst();
    if (!row?.archivo) return c.json({ error: "File not found" }, 404);
    return serveUploadedFile(c, { directory: PUBLICACION_FILE_CONFIG.directory, fileName: row.archivo });
  });

  router.get("/:id/file/download", zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const row = await db.selectFrom("publicacion").select("archivo").where("idPublicacion", "=", id).executeTakeFirst();
    if (!row?.archivo) return c.json({ error: "File not found" }, 404);
    return serveUploadedFile(c, {
      directory: PUBLICACION_FILE_CONFIG.directory,
      fileName: row.archivo,
      asAttachment: true,
    });
  });
}
