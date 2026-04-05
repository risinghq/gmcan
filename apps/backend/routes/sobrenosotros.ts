import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile, serveUploadedFile } from "../lib/upload.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const SOBRE_NOSOTROS_FILE = { directory: "sobrenosotros", kind: "image" } as const;

router.get("/get-sobrenosotros", async (c) => {
  const rows = await db.selectFrom("sobrenosotros").selectAll().execute();
  return c.json(rows);
});

router.put(
  "/update-descripciongrupo",
  zValidator(
    "json",
    z.object({
      idSobreNosotros: z.number().int(),
      quienesSomos: z.string(),
      quienesSomosEN: z.string(),
    }),
  ),
  async (c) => {
    const { idSobreNosotros, quienesSomos, quienesSomosEN } = c.req.valid("json");
    await db
      .updateTable("sobrenosotros")
      .set({ quienesSomos, quienesSomosEN })
      .where("idSobreNosotros", "=", idSobreNosotros)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-objetivosgrupo",
  checkSession,
  zValidator(
    "json",
    z.object({
      idSobreNosotros: z.number().int(),
      objetivos: z.string().optional(),
      objetivosEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idSobreNosotros, objetivos, objetivosEN } = c.req.valid("json");
    await db
      .updateTable("sobrenosotros")
      .set({ objetivos, objetivosEN })
      .where("idSobreNosotros", "=", idSobreNosotros)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/update-serviciosgrupo",
  checkSession,
  zValidator(
    "json",
    z.object({
      idSobreNosotros: z.number().int(),
      servicios: z.string().optional(),
      serviciosEN: z.string().optional(),
    }),
  ),
  async (c) => {
    const { idSobreNosotros, servicios, serviciosEN } = c.req.valid("json");
    await db
      .updateTable("sobrenosotros")
      .set({ servicios, serviciosEN })
      .where("idSobreNosotros", "=", idSobreNosotros)
      .execute();
    return c.json({ status: 1 });
  },
);

router.put("/:id/file", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await db
    .selectFrom("sobrenosotros")
    .select("foto")
    .where("idSobreNosotros", "=", id)
    .executeTakeFirst();
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  const storedFileName = await saveUploadedFile(file, SOBRE_NOSOTROS_FILE);
  if (!storedFileName) return c.json({ error: "Extensión del archivo no válida" }, 400);

  await db.updateTable("sobrenosotros").set({ foto: storedFileName }).where("idSobreNosotros", "=", id).execute();
  if (current.foto && current.foto !== storedFileName) {
    await deleteUploadedFile({ directory: SOBRE_NOSOTROS_FILE.directory, fileName: current.foto });
  }

  return c.json({ status: 1 });
});

router.get("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.selectFrom("sobrenosotros").select("foto").where("idSobreNosotros", "=", id).executeTakeFirst();
  if (!row?.foto) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: SOBRE_NOSOTROS_FILE.directory, fileName: row.foto });
});

export default router;
