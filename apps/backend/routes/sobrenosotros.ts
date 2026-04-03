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

router.put("/upload-sobrenosotros-foto/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(`./uploads/sobrenosotros/${file.name}`, buffer);
  await db.updateTable("sobrenosotros").set({ foto: file.name }).where("idSobreNosotros", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/get-image-sobrenosotros/:imageFile", async (c) => {
  return serveFile(c, `./uploads/sobrenosotros/${c.req.param("imageFile")}`);
});

export default router;
