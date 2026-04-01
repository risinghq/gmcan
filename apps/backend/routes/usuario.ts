import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";
import jwt from "jsonwebtoken";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const SECRET = process.env.JWT_SECRET ?? "VERY_SECRET_KEY!";

const router = new Hono();

router.get("/get-usuario", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenProEN as resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where("DNI", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenProEN as resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where("DNI", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-name", async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select(["DNI", "nombre", "apellidoPaterno", "apellidoMaterno", "foto"])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-full/:id", checkToken, async (c) => {
  try {
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
      .where("DNI", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-usuarios", async (c) => {
  try {
    const usuario = await c.req.json();
    const term = "%" + usuario.nombre + "%";
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where((eb) =>
        eb.or([eb("nombre", "like", term), eb("apellidoPaterno", "like", term), eb("apellidoMaterno", "like", term)]),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-usuarios-global", async (c) => {
  try {
    const usuario = await c.req.json();
    const term = "%" + usuario.nombre + "%";
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "correo",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "fechaNacimiento",
        "resumenPro",
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
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
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-usuario", checkToken, async (c) => {
  try {
    const user = await c.req.json();
    user.password = hashPassword(user.password);
    await db
      .insertInto("usuario")
      .values({
        DNI: user.DNI,
        correo: user.correo,
        password: user.password,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        resumenPro: user.resumenPro,
        resumenProEN: user.resumenProEN,
        fechaNacimiento: user.fechaNacimiento,
        estado: user.estado,
        restablecer: 0,
        tipoUsuario_idTipoUsuario: user.tipoUsuario_idTipoUsuario,
        tipoMiembro_idTipoMiembro: user.tipoMiembro_idTipoMiembro,
        prefijo_idPrefijo: user.prefijo_idPrefijo,
        genero_idGenero: user.genero_idGenero,
      })
      .execute();
    return c.json({ user: user.DNI, message: "El usuario ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-usuario/:id", checkToken, async (c) => {
  try {
    await db.deleteFrom("usuario").where("DNI", "=", c.req.param("id")).execute();
    return c.json({ status: 1 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-usuario", checkToken, async (c) => {
  try {
    const user = await c.req.json();
    await db
      .updateTable("usuario")
      .set({
        correo: user.correo,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        resumenPro: user.resumenPro,
        resumenProEN: user.resumenProEN,
        fechaNacimiento: user.fechaNacimiento,
        estado: user.estado,
        tipoUsuario_idTipoUsuario: user.tipoUsuario_idTipoUsuario,
        tipoMiembro_idTipoMiembro: user.tipoMiembro_idTipoMiembro,
        prefijo_idPrefijo: user.prefijo_idPrefijo,
        genero_idGenero: user.genero_idGenero,
      })
      .where("DNI", "=", user.DNI)
      .execute();
    return c.json({ status: 1, user: user.DNI, message: "El usuario ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-usuario-file/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files: File[] = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const imageName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext === "png" || file_ext === "jpg" || file_ext === "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/usuario/" + file.name, buffer);
      try {
        await db.updateTable("usuario").set({ foto: imageName }).where("DNI", "=", c.req.param("id")).execute();
        return c.json({ status: 1 });
      } catch (err) {
        console.log(err);
        return c.json({ error: "Database error" }, 500);
      }
    } else {
      return c.json({ message: "Extensión del archivo no válida" });
    }
  } else {
    return c.json({ message: "No has subido ninguna imagen" });
  }
});

router.get("/get-image-usuario/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/usuario/" + imageFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    const ext = path.extname(imageFile).slice(1).toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      pdf: "application/pdf",
    };
    return c.body(data, 200, { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" });
  } else {
    return c.json({ message: "no existe la imagen" });
  }
});

// Login user
router.post("/login", async (c) => {
  try {
    const usuario = await c.req.json();
    const row = await db
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
        "foto",
        "estado",
        "tipoUsuario_idTipoUsuario",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where("correo", "=", usuario.correo)
      .executeTakeFirst();

    if (!row) {
      return c.json({ message: "Correo no encontrado", state: 0 });
    }

    const passwordMatch = await verifyPassword(usuario.password, row.password);
    if (!passwordMatch) {
      return c.json({ message: "Contraseña incorrecta ", state: 2 });
    }

    const { correo } = usuario;
    const user = { correo, role: "admin" };
    const token = jwt.sign(user, SECRET, { expiresIn: 300 });
    const refreshToken = crypto.randomBytes(32).toString("hex");

    await db
      .insertInto("refresh_token")
      .values({ token: refreshToken, userCorreo: correo, createdAt: new Date().toISOString() })
      .execute();

    const { password: _pw, ...userWithoutPassword } = row;
    return c.json({ jwt: token, user: userWithoutPassword, refreshToken, state: 1 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/logout", async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    await db.deleteFrom("refresh_token").where("token", "=", refreshToken).execute();
    return new Response(null, { status: 204 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    const row = await db.selectFrom("refresh_token").selectAll().where("token", "=", refreshToken).executeTakeFirst();

    if (!row) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = { correo: row.userCorreo, role: "admin" };
    const token = jwt.sign(user, SECRET, { expiresIn: 300 });
    return c.json({ jwt: token });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-password", checkToken, async (c) => {
  try {
    const user = await c.req.json();
    const hashed = hashPassword(user.password);
    await db
      .updateTable("usuario")
      .set({ password: hashed, restablecer: 0 })
      .where("correo", "=", user.correo)
      .execute();
    return c.json({ message: "La contraseña ha sido actualizada", state: 1 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/check-res/:id", checkToken, async (c) => {
  try {
    const row = await db
      .selectFrom("usuario")
      .select("restablecer")
      .where("correo", "=", c.req.param("id"))
      .executeTakeFirst();
    if (!row) {
      return c.json({ error: "Database error" }, 500);
    }
    return c.json({ state: row.restablecer });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-active/:id", checkToken, async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "correo",
        "foto",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where("estado", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-usuario-verify/:id", checkToken, async (c) => {
  try {
    const rows = await db
      .selectFrom("usuario")
      .select([
        "DNI",
        "nombre",
        "apellidoPaterno",
        "apellidoMaterno",
        "correo",
        "foto",
        "tipoMiembro_idTipoMiembro",
        "prefijo_idPrefijo",
      ])
      .where("tipoMiembro_idTipoMiembro", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/verify-email", checkToken, async (c) => {
  try {
    const user = await c.req.json();
    const rows = await db.selectFrom("usuario").select("DNI").where("correo", "=", user.correo).execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/verify-DNI", checkToken, async (c) => {
  try {
    const user = await c.req.json();
    const rows = await db.selectFrom("usuario").select("DNI").where("DNI", "=", user.DNI).execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

const DIR = "uploads/usuario";

router.delete("/erase-image/:id", checkToken, (c) => {
  try {
    fs.unlinkSync(DIR + "/" + c.req.param("id"));
    return c.json({ message: "Successfully! Image has been Deleted", status: 1 });
  } catch (err) {
    return c.json(err, 400);
  }
});

export default router;
