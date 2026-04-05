import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../lib/upload.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const SlotParam = z.object({ slot: z.enum(["facilidades", "header", "footer"]) });

const SLOT_CONFIG = {
  facilidades: {
    column: "facilidadesRecursosFoto" as const,
    directory: "grupo",
    kind: "image" as const,
  },
  header: {
    column: "logoHeader" as const,
    directory: "grupo",
    kind: "brandImage" as const,
  },
  footer: {
    column: "logoFooter" as const,
    directory: "grupo",
    kind: "brandImage" as const,
  },
};

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

router.put("/:id/files/:slot", checkSession, zValidator("param", IdParam.merge(SlotParam)), async (c) => {
  const { id, slot } = c.req.valid("param");
  const config = SLOT_CONFIG[slot];
  const current = await db.selectFrom("grupo").select(config.column).where("idGrupo", "=", id).executeTakeFirst();
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  const storedFileName = await saveUploadedFile(file, {
    directory: config.directory,
    kind: config.kind,
  });
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

  await db
    .updateTable("grupo")
    .set({ [config.column]: storedFileName })
    .where("idGrupo", "=", id)
    .execute();
  const previousFileName = current[config.column];
  if (previousFileName && previousFileName !== storedFileName) {
    await deleteUploadedFile({ directory: config.directory, fileName: previousFileName });
  }

  return c.json({ status: 1 });
});

router.get("/:id/files/:slot", zValidator("param", IdParam.merge(SlotParam)), async (c) => {
  const { id, slot } = c.req.valid("param");
  const config = SLOT_CONFIG[slot];
  const row = await db.selectFrom("grupo").select(config.column).where("idGrupo", "=", id).executeTakeFirst();
  const fileName = row?.[config.column];
  if (!fileName) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: config.directory, fileName });
});

export default router;
