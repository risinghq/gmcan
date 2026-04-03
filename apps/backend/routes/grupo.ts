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

router.get("/get-grupo", async (c) => {
  const rows = await db.selectFrom("grupo").selectAll().execute();
  return c.json(rows);
});

router.get("/get-grupo-facilidades", async (c) => {
  const rows = await db
    .selectFrom("grupo")
    .select(["facilidadesRecursos", "facilidadesRecursosEN", "facilidadesRecursosFoto", "idGrupo"])
    .execute();
  return c.json(rows);
});

router.get("/get-grupo-trabajosfuturos", async (c) => {
  const rows = await db.selectFrom("grupo").select(["trabajosFuturos", "trabajosFuturosEN", "idGrupo"]).execute();
  return c.json(rows);
});

router.put(
  "/update-grupo-facilidades",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      facilidadesRecursos: z.string().optional(),
      facilidadesRecursosEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idGrupo, facilidadesRecursos, facilidadesRecursosEN } = c.req.valid("json");
    await db
      .updateTable("grupo")
      .set({ facilidadesRecursos, facilidadesRecursosEN })
      .where("idGrupo", "=", idGrupo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-grupo-trabajosfuturos",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      trabajosFuturos: z.string().optional(),
      trabajosFuturosEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idGrupo, trabajosFuturos, trabajosFuturosEN } = c.req.valid("json");
    await db.updateTable("grupo").set({ trabajosFuturos, trabajosFuturosEN }).where("idGrupo", "=", idGrupo).execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-grupo-info",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      correo: z.string().optional(),
      telefono: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idGrupo, correo, telefono } = c.req.valid("json");
    await db.updateTable("grupo").set({ correo, telefono }).where("idGrupo", "=", idGrupo).execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-grupo-seccionpresentacion",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      quienesSomosResumen: z.string(),
      quienesSomosResumenEN: z.string(),
    }),
  ),
  async (c) => {
    const { idGrupo, quienesSomosResumen, quienesSomosResumenEN } = c.req.valid("json");
    await db
      .updateTable("grupo")
      .set({ quienesSomosResumen, quienesSomosResumenEN })
      .where("idGrupo", "=", idGrupo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-grupo-seccionpublicaciones",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      seccionPublicaciones: z.string().optional(),
      seccionPublicacionesEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idGrupo, seccionPublicaciones, seccionPublicacionesEN } = c.req.valid("json");
    await db
      .updateTable("grupo")
      .set({ seccionPublicaciones, seccionPublicacionesEN })
      .where("idGrupo", "=", idGrupo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-grupo-seccionproyectos",
  checkSession,
  zValidator(
    "json",
    z.object({
      idGrupo: z.number().int(),
      seccionProyectos: z.string().optional(),
      seccionProyectosEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idGrupo, seccionProyectos, seccionProyectosEN } = c.req.valid("json");
    await db
      .updateTable("grupo")
      .set({ seccionProyectos, seccionProyectosEN })
      .where("idGrupo", "=", idGrupo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put("/upload-image-facilidades/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["jpg", "png", "jpeg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  fs.writeFileSync(`./uploads/grupo/${file.name}`, Buffer.from(await file.arrayBuffer()));
  await db.updateTable("grupo").set({ facilidadesRecursosFoto: file.name }).where("idGrupo", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/upload-grupo-header/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["png", "svg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  fs.writeFileSync(`./uploads/grupo/${file.name}`, Buffer.from(await file.arrayBuffer()));
  await db.updateTable("grupo").set({ logoHeader: file.name }).where("idGrupo", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/upload-grupo-footer/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["png", "svg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  fs.writeFileSync(`./uploads/grupo/${file.name}`, Buffer.from(await file.arrayBuffer()));
  await db.updateTable("grupo").set({ logoFooter: file.name }).where("idGrupo", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/get-image-grupo/:imageFile", async (c) => {
  return serveFile(c, `./uploads/grupo/${c.req.param("imageFile")}`);
});

router.get("/get-image-facilidades/:imageFile", async (c) => {
  return serveFile(c, `./uploads/grupo/${c.req.param("imageFile")}`);
});

export default router;
