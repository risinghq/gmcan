import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../lib/upload.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Body = z.object({
  titulo: z.string().optional(),
  tituloEN: z.string().optional(),
  resumen: z.string().optional(),
  resumenEN: z.string().optional(),
  cuerpo: z.string().optional(),
  cuerpoEN: z.string().optional(),
  estado: z.number().int().optional(),
  fechaPublicacion: z.string().optional(),
  autorPublicacion: z.string().optional(),
  tipoNoticia_idtipoNoticia: z.number().int().optional(),
});

const UpdateBody = Body.extend({ idNoticia: z.number().int() });
const NOTICIA_FILE = {
  directory: "noticia",
  kind: "image",
} as const;

router.get("/get-noticia", async (c) => {
  const rows = await db.selectFrom("noticia").selectAll().execute();
  return c.json(rows);
});

router.get("/get-noticia/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("noticia").selectAll().where("idNoticia", "=", id).execute();
  return c.json(rows);
});

router.get("/get-noticiausuario/:id", async (c) => {
  const rows = await db.selectFrom("noticia").selectAll().where("autorPublicacion", "=", c.req.param("id")).execute();
  return c.json(rows);
});

router.get("/get-noticiatipo/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("noticia").selectAll().where("tipoNoticia_idtipoNoticia", "=", id).execute();
  return c.json(rows);
});

router.get("/get-noticiafull/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("noticia").selectAll().where("idNoticia", "=", id).executeTakeFirst();
  return c.json(row);
});

router.post("/search-noticia-global", zValidator("json", z.object({ nombre: z.string() })), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("noticia")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb("titulo", "like", term),
        eb("tituloEN", "like", term),
        eb("cuerpo", "like", term),
        eb("cuerpoEN", "like", term),
        eb("resumen", "like", term),
        eb("resumenEN", "like", term),
        eb("fechaPublicacion", "like", term),
      ]),
    )
    .execute();
  return c.json(rows);
});

router.post("/post-noticia", checkSession, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("noticia").values(body).executeTakeFirst();
  return c.json({ idNoticia: Number(result.insertId) }, 201);
});

router.delete("/delete-noticia/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("noticia").where("idNoticia", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-noticia", zValidator("json", UpdateBody), async (c) => {
  const { idNoticia, ...fields } = c.req.valid("json");
  await db.updateTable("noticia").set(fields).where("idNoticia", "=", idNoticia).execute();
  return c.json({ status: 1 });
});

router.put("/:id/file", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await db.selectFrom("noticia").select("foto").where("idNoticia", "=", id).executeTakeFirst();
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const storedFileName = await saveUploadedFile(file, NOTICIA_FILE);
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

  await db.updateTable("noticia").set({ foto: storedFileName }).where("idNoticia", "=", id).execute();
  if (current.foto && current.foto !== storedFileName) {
    await deleteUploadedFile({ directory: NOTICIA_FILE.directory, fileName: current.foto });
  }

  return c.json({ status: 1 });
});

router.get("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("noticia").select("foto").where("idNoticia", "=", id).executeTakeFirst();
  if (!row?.foto) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: NOTICIA_FILE.directory, fileName: row.foto });
});

export default router;
