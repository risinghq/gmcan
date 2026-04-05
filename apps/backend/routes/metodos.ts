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
  descripcion: z.string(),
  descripcionEN: z.string().optional(),
  grupo_idGrupo: z.number().int(),
});
const UpdateBody = Body.extend({ idMetodo: z.number().int() });
const METODO_FILE = {
  directory: "metodos",
  kind: "image",
} as const;

router.get("/get-metodo", async (c) => {
  const rows = await db.selectFrom("metodo").selectAll().execute();
  return c.json(rows);
});

router.get("/get-metodo/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("metodo").selectAll().where("idMetodo", "=", id).execute();
  return c.json(rows);
});

router.post("/post-metodo", checkSession, zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("metodo").values(body).executeTakeFirst();
  return c.json({ idMetodo: Number(result.insertId) }, 201);
});

router.delete("/delete-metodo/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("metodo").where("idMetodo", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-metodo", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { idMetodo, ...fields } = c.req.valid("json");
  await db.updateTable("metodo").set(fields).where("idMetodo", "=", idMetodo).execute();
  return c.json({ status: 1 });
});

router.put("/:id/file", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await db.selectFrom("metodo").select("foto").where("idMetodo", "=", id).executeTakeFirst();
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const storedFileName = await saveUploadedFile(file, METODO_FILE);
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

  await db.updateTable("metodo").set({ foto: storedFileName }).where("idMetodo", "=", id).execute();
  if (current.foto && current.foto !== storedFileName) {
    await deleteUploadedFile({ directory: METODO_FILE.directory, fileName: current.foto });
  }

  return c.json({ status: 1 });
});

router.get("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("metodo").select("foto").where("idMetodo", "=", id).executeTakeFirst();
  if (!row?.foto) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: METODO_FILE.directory, fileName: row.foto });
});

export default router;
