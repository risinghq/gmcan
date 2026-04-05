import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { extractFirstFile, saveUploadedFile, serveUploadedFile } from "../lib/upload.js";

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

router.put("/upload-metodo-foto/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const storedFileName = await saveUploadedFile(file, { directory: "metodos", allowedExtensions: ["png", "jpg", "jpeg"] });
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);
  await db.updateTable("metodo").set({ foto: storedFileName }).where("idMetodo", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/get-image-metodo/:imageFile", async (c) => {
  return serveUploadedFile(c, "metodos", c.req.param("imageFile"));
});

export default router;
