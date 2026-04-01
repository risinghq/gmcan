import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-lineasinvestigacion", async (c) => {
  try {
    const rows = await db.selectFrom("lineasinvestigacion").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-lineasinvestigacion-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("lineasinvestigacion")
      .select([
        "idLineasInvestigacion",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("descripcionEN").as("descripcion"),
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-lineasinvestigacion/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("lineasinvestigacion")
      .selectAll()
      .where("idLineasInvestigacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-lineasinvestigacion-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("lineasinvestigacion")
      .select([
        "idLineasInvestigacion",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("descripcionEN").as("descripcion"),
      ])
      .where("idLineasInvestigacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-lineasinvestigacion", async (c) => {
  try {
    const lineasinvestigacion = await c.req.json();
    const rows = await db
      .selectFrom("lineasinvestigacion")
      .selectAll()
      .where("nombre", "like", "%" + lineasinvestigacion.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-lineasinvestigacion-en", async (c) => {
  try {
    const lineasinvestigacion = await c.req.json();
    const rows = await db
      .selectFrom("lineasinvestigacion")
      .select([
        "idLineasInvestigacion",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "grupo_idGrupo",
      ])
      .where("nombreEN", "like", "%" + lineasinvestigacion.nombre + "%")
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-lineasinvestigacion", checkToken, async (c) => {
  try {
    const lineasinvestigacion = await c.req.json();
    const result = await db
      .insertInto("lineasinvestigacion")
      .values({
        nombre: lineasinvestigacion.nombre,
        nombreEN: lineasinvestigacion.nombreEN,
        descripcion: lineasinvestigacion.descripcion,
        descripcionEN: lineasinvestigacion.descripcionEN,
        grupo_idGrupo: lineasinvestigacion.grupo_idGrupo,
      })
      .executeTakeFirst();
    return c.json({
      status: 1,
      idLineasInvestigacion: Number(result.insertId),
      message: "La línea ha sido guardada",
    });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-lineasinvestigacion/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("lineasinvestigacion")
      .where("idLineasInvestigacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Borrado exitosamente" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-lineasinvestigacion", checkToken, async (c) => {
  try {
    const lineasinvestigacion = await c.req.json();
    await db
      .updateTable("lineasinvestigacion")
      .set({
        nombre: lineasinvestigacion.nombre,
        nombreEN: lineasinvestigacion.nombreEN,
        descripcion: lineasinvestigacion.descripcion,
        descripcionEN: lineasinvestigacion.descripcionEN,
        grupo_idGrupo: lineasinvestigacion.grupo_idGrupo,
      })
      .where("idLineasInvestigacion", "=", Number(lineasinvestigacion.idLineasInvestigacion))
      .execute();
    return c.json({ status: 1, message: "El lineasinvestigacion ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-lineainvestigacion-foto/:id", checkToken, async (c) => {
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
    if (file_ext === "png" || file_ext === "jpg" || file_ext === "jpeg") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync("./uploads/lineainvestigacion/" + file.name, buffer);
        await db
          .updateTable("lineasinvestigacion")
          .set({ foto: fotoName })
          .where("idLineasInvestigacion", "=", Number(c.req.param("id")))
          .execute();
        return c.json({ status: 1, message: "Foto actualizada" });
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

router.get("/get-image-lineainvestigacion/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/lineainvestigacion/" + imageFile;
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
    return c.body(data, 200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  } else {
    return c.json({ message: "no existe la imagen" });
  }
});

export default router;
