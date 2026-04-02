import fs from "node:fs";
import path from "node:path";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.js";
import { extractFirstFile, serveFile } from "../lib/upload.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Body = z.object({
  titulo: z.string().min(1),
  resumen: z.string().optional(),
  resumenEN: z.string().optional(),
  DOI: z.string().optional(),
  fechaPublicacion: z.string(),
  nroRevista: z.number().optional(),
  tipoPublicacion_idTipoPublicacion: z.number().int(),
  revista_idRevista: z.number().int().optional(),
  universidad_idUniversidad: z.number().int().optional(),
  tipoTesis_idTipoTesis: z.number().int().optional(),
  evento_idEvento: z.number().int().optional(),
});

const UpdateBody = Body.extend({ idPublicacion: z.number().int() });

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

router.post(
  "/search-publicaciones",
  zValidator(
    "json",
    z.object({
      titulo: z.string(),
      tipoPublicacion_idTipoPublicacion: z.number().int(),
    }),
  ),
  async (c) => {
    const { titulo, tipoPublicacion_idTipoPublicacion } = c.req.valid("json");
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("titulo", "like", `%${titulo}%`)
      .where("tipoPublicacion_idTipoPublicacion", "=", tipoPublicacion_idTipoPublicacion)
      .execute();
    return c.json(rows);
  },
);

router.post("/search-publicaciones-global", zValidator("json", z.object({ titulo: z.string() })), async (c) => {
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

router.post("/post-publicacion", zValidator("json", Body), async (c) => {
  const body = c.req.valid("json");
  const result = await db.insertInto("publicacion").values(body).executeTakeFirst();
  return c.json({ idPublicacion: Number(result.insertId) }, 201);
});

router.delete("/delete-publicacion/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("publicacion").where("idPublicacion", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-publicacion", zValidator("json", UpdateBody), async (c) => {
  const { idPublicacion, ...fields } = c.req.valid("json");
  await db.updateTable("publicacion").set(fields).where("idPublicacion", "=", idPublicacion).execute();
  return c.json({ status: 1 });
});

router.put("/upload-publicacion-file/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (ext !== "pdf") return c.json({ error: "Extensión del archivo no válida" }, 400);
  fs.writeFileSync(`./uploads/publicaciones/${file.name}`, Buffer.from(await file.arrayBuffer()));
  await db.updateTable("publicacion").set({ archivo: file.name }).where("idPublicacion", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/download-publicacion/:pdfFile", async (c) => {
  const pdfFile = c.req.param("pdfFile");
  const filePath = `./uploads/publicaciones/${pdfFile}`;
  if (!fs.existsSync(filePath)) return c.json({ error: "File not found" }, 404);
  const data = await fs.promises.readFile(filePath);
  return c.body(data, 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${pdfFile}"`,
  });
});

router.get("/get-file-publicacion/:pdfFile", async (c) => {
  return serveFile(c, `./uploads/publicaciones/${c.req.param("pdfFile")}`);
});

export default router;
