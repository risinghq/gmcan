import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-grupo", async (c) => {
  try {
    const rows = await db.selectFrom("grupo").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-grupo-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("grupo")
      .select([
        "idGrupo",
        "quienesSomosResumenEN as quienesSomosResumen",
        "direccion",
        "correo",
        "nombreGrupo2",
        "trabajosFuturosEN as trabajosFuturos",
        "telefono",
        "logoHeader",
        "logoFooter",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-grupo-facilidades", async (c) => {
  try {
    const rows = await db
      .selectFrom("grupo")
      .select(["facilidadesRecursos", "facilidadesRecursosEN", "facilidadesRecursosFoto", "idGrupo"])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-grupo-trabajosfuturos", async (c) => {
  try {
    const rows = await db.selectFrom("grupo").select(["trabajosFuturos", "trabajosFuturosEN", "idGrupo"]).execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-facilidades", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        facilidadesRecursos: grupo.facilidadesRecursos,
        facilidadesRecursosEN: grupo.facilidadesRecursosEN,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-trabajosfuturos", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        trabajosFuturos: grupo.trabajosFuturos,
        trabajosFuturosEN: grupo.trabajosFuturosEN,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-info", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        correo: grupo.correo,
        telefono: grupo.telefono,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-seccionpresentacion", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        quienesSomosResumen: grupo.quienesSomosResumen,
        quienesSomosResumenEN: grupo.quienesSomosResumenEN,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-seccionpublicaciones", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        seccionPublicaciones: grupo.seccionPublicaciones,
        seccionPublicacionesEN: grupo.seccionPublicacionesEN,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-grupo-seccionproyectos", checkToken, async (c) => {
  try {
    const grupo = await c.req.json();
    await db
      .updateTable("grupo")
      .set({
        seccionProyectos: grupo.seccionProyectos,
        seccionProyectosEN: grupo.seccionProyectosEN,
      })
      .where("idGrupo", "=", Number(grupo.idGrupo))
      .execute();
    return c.json({ status: 1, message: "El grupo ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-image-facilidades/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files: File[] = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext === "jpg" || file_ext === "png" || file_ext === "jpeg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
      try {
        await db
          .updateTable("grupo")
          .set({ facilidadesRecursosFoto: fotoName })
          .where("idGrupo", "=", Number(c.req.param("id")))
          .execute();
        return c.json({ message: "La foto de facilidades ha sido actualizado" });
      } catch (err) {
        console.log(err);
        return c.json({ error: "Database error" }, 500);
      }
    } else {
      return c.json({ message: "Extensión del archivo no válida solo SVG" });
    }
  } else {
    return c.json({ message: "No has subido ninguna imagen" });
  }
});

router.put("/upload-grupo-header/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files: File[] = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext === "png" || file_ext === "svg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
      try {
        await db
          .updateTable("grupo")
          .set({ logoHeader: fotoName })
          .where("idGrupo", "=", Number(c.req.param("id")))
          .execute();
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

router.put("/upload-grupo-footer/:id", checkToken, async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files: File[] = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const fotoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext === "png" || file_ext === "svg") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/grupo/" + file.name, buffer);
      try {
        await db
          .updateTable("grupo")
          .set({ logoFooter: fotoName })
          .where("idGrupo", "=", Number(c.req.param("id")))
          .execute();
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

router.get("/get-image-grupo/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/grupo/" + imageFile;
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

router.get("/get-image-facilidades/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/grupo/" + imageFile;
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

export default router;
