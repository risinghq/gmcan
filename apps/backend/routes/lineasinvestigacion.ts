import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../lib/upload.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({
  nombre: z.string().min(1),
  nombreEN: z.string().min(1),
  descripcion: z.string().optional(),
  descripcionEN: z.string().optional(),
  grupo_idGrupo: z.number().int(),
});
const UpdateBody = Body.extend({ idLineasInvestigacion: z.number().int() });
const SearchBody = z.object({ nombre: z.string() });
const LINEA_INVESTIGACION_FILE = {
  directory: "lineainvestigacion",
  kind: "image",
} as const;

router.get("/get-lineasinvestigacion", async (c) => {
  const rows = await db.selectFrom("lineasinvestigacion").selectAll().execute();
  return c.json(rows);
});

router.get("/get-lineasinvestigacion/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("lineasinvestigacion").selectAll().where("idLineasInvestigacion", "=", id).execute();
  return c.json(rows);
});

router.post("/search-lineasinvestigacion", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("lineasinvestigacion")
    .selectAll()
    .where((eb) => eb.or([eb("nombre", "like", term), eb("nombreEN", "like", term)]))
    .execute();
  return c.json(rows);
});

router.post("/post-lineasinvestigacion", checkSession, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("lineasinvestigacion").values(body).executeTakeFirst();
  return c.json({ idLineasInvestigacion: Number(result.insertId) }, 201);
});

router.delete("/delete-lineasinvestigacion/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("lineasinvestigacion").where("idLineasInvestigacion", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-lineasinvestigacion", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idLineasInvestigacion, ...fields } = c.req.valid("json");
  await db
    .updateTable("lineasinvestigacion")
    .set(fields)
    .where("idLineasInvestigacion", "=", idLineasInvestigacion)
    .execute();
  return c.json({ status: 1 });
});

router.put("/:id/file", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await db
    .selectFrom("lineasinvestigacion")
    .select("foto")
    .where("idLineasInvestigacion", "=", id)
    .executeTakeFirst();
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const storedFileName = await saveUploadedFile(file, LINEA_INVESTIGACION_FILE);
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

  await db
    .updateTable("lineasinvestigacion")
    .set({ foto: storedFileName })
    .where("idLineasInvestigacion", "=", id)
    .execute();
  if (current.foto && current.foto !== storedFileName) {
    await deleteUploadedFile({ directory: LINEA_INVESTIGACION_FILE.directory, fileName: current.foto });
  }

  return c.json({ status: 1 });
});

router.get("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db
    .selectFrom("lineasinvestigacion")
    .select("foto")
    .where("idLineasInvestigacion", "=", id)
    .executeTakeFirst();
  if (!row?.foto) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: LINEA_INVESTIGACION_FILE.directory, fileName: row.foto });
});

export default router;
