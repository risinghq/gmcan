import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";

import { checkSession } from "../../auth/session.js";
import { db } from "../../db/client.js";
import { downloadUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../../lib/upload.js";
import { IdParam } from "./schema.js";

export function registerPublicacionFileRoutes(router: Hono): void {
  router.put("/upload-publicacion-file/:id", checkSession, zValidator("param", IdParam), async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.parseBody({ all: true });
    const file = extractFirstFile(body);
    if (!file) return c.json({ error: "No file uploaded" }, 400);
    const storedFileName = await saveUploadedFile(file, { directory: "publicaciones", allowedExtensions: ["pdf"] });
    if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);
    await db.updateTable("publicacion").set({ archivo: storedFileName }).where("idPublicacion", "=", id).execute();
    return c.json({ status: 1 });
  });

  router.get("/download-publicacion/:pdfFile", async (c) => {
    return downloadUploadedFile(c, "publicaciones", c.req.param("pdfFile"));
  });

  router.get("/get-file-publicacion/:pdfFile", async (c) => {
    return serveUploadedFile(c, "publicaciones", c.req.param("pdfFile"));
  });
}