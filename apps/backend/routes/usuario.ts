import fs from "node:fs";
import path from "node:path";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkSession, createSession, destroySession } from "../auth/session.js";
import { db } from "../db/client.js";
import { USUARIO_PUBLIC, USUARIO_NAME, USUARIO_ACTIVE } from "../db/projections.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { extractFirstFile, serveFile } from "../lib/upload.js";

const router = new Hono();

const IdParam = z.object({ id: z.coerce.number().int().positive() });
const DniParam = z.object({ id: z.string().min(1) });
const SearchBody = z.object({ nombre: z.string() });

const CreateBody = z.object({
  DNI: z.string().min(1),
  correo: z.string().email(),
  password: z.string().min(1),
  nombre: z.string().min(1),
  apellidoPaterno: z.string().min(1),
  apellidoMaterno: z.string().optional(),
  resumenPro: z.string().optional(),
  resumenProEN: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  estado: z.number().int(),
  tipoUsuario_idTipoUsuario: z.number().int(),
  tipoMiembro_idTipoMiembro: z.number().int(),
  prefijo_idPrefijo: z.number().int().optional(),
  genero_idGenero: z.number().int().optional(),
});

const UpdateBody = z.object({
  DNI: z.string().min(1),
  correo: z.string().email(),
  nombre: z.string().min(1),
  apellidoPaterno: z.string().min(1),
  apellidoMaterno: z.string().optional(),
  resumenPro: z.string().optional(),
  resumenProEN: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  estado: z.number().int(),
  tipoUsuario_idTipoUsuario: z.number().int(),
  tipoMiembro_idTipoMiembro: z.number().int(),
  prefijo_idPrefijo: z.number().int().optional(),
  genero_idGenero: z.number().int().optional(),
});

router.get("/get-usuario", async (c) => {
  const rows = await db.selectFrom("usuario").select(USUARIO_PUBLIC).execute();
  return c.json(rows);
});

router.get("/get-usuario/:id", zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("usuario").select(USUARIO_PUBLIC).where("DNI", "=", id).execute();
  return c.json(rows);
});

router.get("/get-usuario-name", async (c) => {
  const rows = await db.selectFrom("usuario").select(USUARIO_NAME).execute();
  return c.json(rows);
});

router.get("/get-usuario-full/:id", checkSession, zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("usuario")
    .select([
      "DNI",
      "correo",
      "password",
      "nombre",
      "apellidoPaterno",
      "apellidoMaterno",
      "fechaNacimiento",
      "resumenPro",
      "resumenProEN",
      "foto",
      "estado",
      "tipoUsuario_idTipoUsuario",
      "tipoMiembro_idTipoMiembro",
      "prefijo_idPrefijo",
      "genero_idGenero",
    ])
    .where("DNI", "=", id)
    .execute();
  return c.json(rows);
});

router.post("/search-usuarios", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("usuario")
    .select(USUARIO_PUBLIC)
    .where((eb) =>
      eb.or([eb("nombre", "like", term), eb("apellidoPaterno", "like", term), eb("apellidoMaterno", "like", term)]),
    )
    .execute();
  return c.json(rows);
});

router.post("/search-usuarios-global", zValidator("json", SearchBody), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("usuario")
    .select(USUARIO_PUBLIC)
    .where((eb) =>
      eb.or([
        eb("nombre", "like", term),
        eb("apellidoPaterno", "like", term),
        eb("apellidoMaterno", "like", term),
        eb("correo", "like", term),
      ]),
    )
    .execute();
  return c.json(rows);
});

router.post("/post-usuario", checkSession, zValidator("json", CreateBody), async (c) => {
  const { password, ...rest } = c.req.valid("json");
  await db
    .insertInto("usuario")
    .values({ ...rest, password: hashPassword(password), restablecer: 0 })
    .execute();
  return c.json({ user: rest.DNI }, 201);
});

router.delete("/delete-usuario/:id", checkSession, zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("usuario").where("DNI", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-usuario", checkSession, zValidator("json", UpdateBody), async (c) => {
  const { DNI, ...fields } = c.req.valid("json");
  await db.updateTable("usuario").set(fields).where("DNI", "=", DNI).execute();
  return c.json({ status: 1 });
});

router.put("/upload-usuario-file/:id", checkSession, zValidator("param", DniParam), async (c) => {
  const { id } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const ext = path.extname(file.name).slice(1).toLowerCase();
  if (!["png", "jpg", "jpeg"].includes(ext)) return c.json({ error: "Extensión del archivo no válida" }, 400);
  fs.writeFileSync(`./uploads/usuario/${file.name}`, Buffer.from(await file.arrayBuffer()));
  await db.updateTable("usuario").set({ foto: file.name }).where("DNI", "=", id).execute();
  return c.json({ status: 1 });
});

router.get("/get-image-usuario/:imageFile", async (c) => {
  return serveFile(c, `./uploads/usuario/${c.req.param("imageFile")}`);
});

router.post(
  "/login",
  zValidator("json", z.object({ correo: z.string().email(), password: z.string().min(1) })),
  async (c) => {
    const { correo, password } = c.req.valid("json");
    const row = await db
      .selectFrom("usuario")
      .select([...USUARIO_PUBLIC, "password"])
      .where("correo", "=", correo)
      .executeTakeFirst();

    if (!row) return c.json({ message: "Correo no encontrado", state: 0 }, 401);

    const match = await verifyPassword(password, row.password);
    if (!match) return c.json({ message: "Contraseña incorrecta", state: 2 }, 401);

    const { password: _pw, ...user } = row;
    await createSession(c, row.DNI, correo);
    return c.json({ user, state: 1 });
  },
);

router.post("/logout", async (c) => {
  await destroySession(c);
  return new Response(null, { status: 204 });
});

router.put(
  "/update-password",
  checkSession,
  zValidator("json", z.object({ correo: z.string().email(), password: z.string().min(1) })),
  async (c) => {
    const { correo, password } = c.req.valid("json");
    await db
      .updateTable("usuario")
      .set({ password: hashPassword(password), restablecer: 0 })
      .where("correo", "=", correo)
      .execute();
    return c.json({ status: 1 });
  },
);

router.get("/check-res/:id", checkSession, async (c) => {
  const row = await db
    .selectFrom("usuario")
    .select("restablecer")
    .where("correo", "=", c.req.param("id"))
    .executeTakeFirst();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ state: row.restablecer });
});

router.get("/get-usuario-active/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("usuario").select(USUARIO_ACTIVE).where("estado", "=", id).execute();
  return c.json(rows);
});

router.get("/get-usuario-verify/:id", checkSession, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("usuario")
    .select(USUARIO_ACTIVE)
    .where("tipoMiembro_idTipoMiembro", "=", id)
    .execute();
  return c.json(rows);
});

router.post("/verify-email", checkSession, zValidator("json", z.object({ correo: z.string().email() })), async (c) => {
  const { correo } = c.req.valid("json");
  const rows = await db.selectFrom("usuario").select("DNI").where("correo", "=", correo).execute();
  return c.json(rows);
});

router.post("/verify-DNI", checkSession, zValidator("json", z.object({ DNI: z.string().min(1) })), async (c) => {
  const { DNI } = c.req.valid("json");
  const rows = await db.selectFrom("usuario").select("DNI").where("DNI", "=", DNI).execute();
  return c.json(rows);
});

router.delete("/erase-image/:id", checkSession, (c) => {
  try {
    fs.unlinkSync(`uploads/usuario/${c.req.param("id")}`);
    return c.json({ status: 1 });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

export default router;
