import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-publicacion", async (c) => {
  try {
    const rows = await db.selectFrom("publicacion").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacion-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacion/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacion-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicaciones/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("tipoPublicacion_idTipoPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicaciones-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("tipoPublicacion_idTipoPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

// NOTE: Original JS had a typo `WHER = ?` with no column name; fixed to filter by evento_idEvento
router.get("/get-publicacionesciudad/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("evento_idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

// NOTE: Original JS had a typo `WHER=?` with no column name; fixed to filter by evento_idEvento
router.get("/get-publicacionesciudad-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("evento_idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesevento/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("evento_idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesevento-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("evento_idEvento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesuniversidad/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("universidad_idUniversidad", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesuniversidad-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("universidad_idUniversidad", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesrevista/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("revista_idRevista", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-publicacionesrevista-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where("revista_idRevista", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-publicaciones", async (c) => {
  try {
    const publicacion = await c.req.json();
    const term = "%" + publicacion.titulo + "%";
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where("titulo", "like", term)
      .where("tipoPublicacion_idTipoPublicacion", "=", Number(publicacion.tipoPublicacion_idTipoPublicacion))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-publicaciones-global", async (c) => {
  try {
    const publicacion = await c.req.json();
    const term = "%" + publicacion.titulo + "%";
    const rows = await db
      .selectFrom("publicacion")
      .selectAll()
      .where((eb) =>
        eb.or([eb("titulo", "like", term), eb("fechaPublicacion", "like", term), eb("resumen", "like", term)]),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-publicaciones-global-en", async (c) => {
  try {
    const publicacion = await c.req.json();
    const term = "%" + publicacion.titulo + "%";
    const rows = await db
      .selectFrom("publicacion")
      .select([
        "idPublicacion",
        "titulo",
        "archivo",
        "resumenEN as resumen",
        "nroRevista",
        "DOI",
        "fechaPublicacion",
        "tipoPublicacion_idTipoPublicacion",
        "revista_idRevista",
        "universidad_idUniversidad",
        "evento_idEvento",
        "tipoTesis_idTipoTesis",
      ])
      .where((eb) =>
        eb.or([eb("titulo", "like", term), eb("fechaPublicacion", "like", term), eb("resumenEN", "like", term)]),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-publicacion", async (c) => {
  try {
    const publicacion = await c.req.json();
    const result = await db
      .insertInto("publicacion")
      .values({
        titulo: publicacion.titulo,
        resumen: publicacion.resumen,
        resumenEN: publicacion.resumenEN,
        DOI: publicacion.DOI,
        fechaPublicacion: publicacion.fechaPublicacion,
        nroRevista: publicacion.nroRevista,
        tipoPublicacion_idTipoPublicacion: publicacion.tipoPublicacion_idTipoPublicacion,
        revista_idRevista: publicacion.revista_idRevista,
        universidad_idUniversidad: publicacion.universidad_idUniversidad,
        tipoTesis_idTipoTesis: publicacion.tipoTesis_idTipoTesis,
        evento_idEvento: publicacion.evento_idEvento,
      })
      .executeTakeFirst();
    return c.json({
      status: 1,
      idPublicacion: Number(result.insertId),
      message: "La publicacion ha sido guardada",
    });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-publicacion/:id", async (c) => {
  try {
    await db
      .deleteFrom("publicacion")
      .where("idPublicacion", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1 });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-publicacion", async (c) => {
  try {
    const publicacion = await c.req.json();
    await db
      .updateTable("publicacion")
      .set({
        titulo: publicacion.titulo,
        resumen: publicacion.resumen,
        resumenEN: publicacion.resumenEN,
        DOI: publicacion.DOI,
        fechaPublicacion: publicacion.fechaPublicacion,
        nroRevista: publicacion.nroRevista,
        tipoPublicacion_idTipoPublicacion: publicacion.tipoPublicacion_idTipoPublicacion,
        revista_idRevista: publicacion.revista_idRevista,
        universidad_idUniversidad: publicacion.universidad_idUniversidad,
        tipoTesis_idTipoTesis: publicacion.tipoTesis_idTipoTesis,
        evento_idEvento: publicacion.evento_idEvento,
      })
      .where("idPublicacion", "=", Number(publicacion.idPublicacion))
      .execute();
    return c.json({ status: 1, message: "La publicacion ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-publicacion-file/:id", async (c) => {
  const body = await c.req.parseBody({ all: true });

  const files: File[] = [];
  for (const value of Object.values(body)) {
    if (value instanceof File) files.push(value);
    else if (Array.isArray(value)) files.push(...value.filter((v) => v instanceof File));
  }

  if (files.length > 0) {
    const file = files[0];
    const archivoName = file.name;
    const file_ext = path.extname(file.name).slice(1).toLowerCase();
    if (file_ext === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync("./uploads/publicaciones/" + file.name, buffer);
      try {
        await db
          .updateTable("publicacion")
          .set({ archivo: archivoName })
          .where("idPublicacion", "=", Number(c.req.param("id")))
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

router.get("/download-publicacion/:pdfFile", async (c) => {
  const pdfFile = c.req.param("pdfFile");
  const path_file = "./uploads/publicaciones/" + pdfFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    return c.body(data, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFile}"`,
    });
  } else {
    return c.json({ message: "no existe el archivo" });
  }
});

router.get("/get-file-publicacion/:pdfFile", async (c) => {
  const pdfFile = c.req.param("pdfFile");
  const path_file = "./uploads/publicaciones/" + pdfFile;
  if (fs.existsSync(path_file)) {
    const data = await fs.promises.readFile(path_file);
    return c.body(data, 200, { "Content-Type": "application/pdf" });
  } else {
    return c.json({ message: "no existe la imagen" });
  }
});

export default router;
