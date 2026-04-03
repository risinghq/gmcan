import fs from "node:fs";
import path from "node:path";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { extractFirstFile, serveFile } from "../lib/upload.js";

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

router.put("/upload-lineainvestigacion-foto/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(`./uploads/lineainvestigacion/${file.name}`, buffer);
  await db
    .updateTable("lineasinvestigacion")
    .set({ foto: file.name })
    .where("idLineasInvestigacion", "=", id)
    .execute();
  return c.json({ status: 1 });
});

router.get("/get-image-lineainvestigacion/:imageFile", async (c) => {
  return serveFile(c, `./uploads/lineainvestigacion/${c.req.param("imageFile")}`);
});

export default router;
