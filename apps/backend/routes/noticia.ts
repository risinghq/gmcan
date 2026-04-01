import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-noticia", async (c) => {
  try {
    const rows = await db.selectFrom("noticia").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticia-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .select([
        "idNoticia",
        (eb) => eb.ref("tituloEN").as("titulo"),
        (eb) => eb.ref("resumenEN").as("resumen"),
        (eb) => eb.ref("cuerpoEN").as("cuerpo"),
        "estado",
        "fechaPublicacion",
        "fechaActualizacion",
        "foto",
        "prioridad",
        "autorPublicacion",
        "tipoNoticia_idtipoNoticia",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticia/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .selectAll()
      .where("idNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticia-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .select([
        "idNoticia",
        (eb) => eb.ref("tituloEN").as("titulo"),
        (eb) => eb.ref("resumenEN").as("resumen"),
        (eb) => eb.ref("cuerpoEN").as("cuerpo"),
        "estado",
        "fechaPublicacion",
        "fechaActualizacion",
        "foto",
        "prioridad",
        "autorPublicacion",
        "tipoNoticia_idtipoNoticia",
      ])
      .where("idNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticiausuario/:id", async (c) => {
  try {
    const rows = await db.selectFrom("noticia").selectAll().where("autorPublicacion", "=", c.req.param("id")).execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticiausuario-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .select([
        "idNoticia",
        (eb) => eb.ref("tituloEN").as("titulo"),
        (eb) => eb.ref("resumenEN").as("resumen"),
        (eb) => eb.ref("cuerpoEN").as("cuerpo"),
        "estado",
        "fechaPublicacion",
        "fechaActualizacion",
        "foto",
        "prioridad",
        "autorPublicacion",
        "tipoNoticia_idtipoNoticia",
      ])
      .where("autorPublicacion", "=", c.req.param("id"))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticiatipo/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .selectAll()
      .where("tipoNoticia_idtipoNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticiatipo-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("noticia")
      .select([
        "idNoticia",
        (eb) => eb.ref("tituloEN").as("titulo"),
        (eb) => eb.ref("resumenEN").as("resumen"),
        (eb) => eb.ref("cuerpoEN").as("cuerpo"),
        "estado",
        "fechaPublicacion",
        "fechaActualizacion",
        "foto",
        "prioridad",
        "autorPublicacion",
        "tipoNoticia_idtipoNoticia",
      ])
      .where("tipoNoticia_idtipoNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-noticiafull/:id", checkToken, async (c) => {
  try {
    const row = await db
      .selectFrom("noticia")
      .selectAll()
      .where("idNoticia", "=", Number(c.req.param("id")))
      .executeTakeFirst();
    return c.json(row);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-noticia-global", async (c) => {
  try {
    const noticia = await c.req.json();
    const term = "%" + noticia.nombre + "%";
    const rows = await db
      .selectFrom("noticia")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("titulo", "like", term),
          eb("cuerpo", "like", term),
          eb("resumen", "like", term),
          eb("fechaPublicacion", "like", term),
        ]),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-noticia-global-en", async (c) => {
  try {
    const noticia = await c.req.json();
    const term = "%" + noticia.nombre + "%";
    const rows = await db
      .selectFrom("noticia")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("tituloEN", "like", term),
          eb("cuerpoEN", "like", term),
          eb("resumenEN", "like", term),
          eb("fechaPublicacion", "like", term),
        ]),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-noticia", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    const result = await db
      .insertInto("noticia")
      .values({
        titulo: not.titulo,
        tituloEN: not.tituloEN,
        resumen: not.resumen,
        resumenEN: not.resumenEN,
        cuerpo: not.cuerpo,
        cuerpoEN: not.cuerpoEN,
        estado: not.estado,
        fechaPublicacion: not.fechaPublicacion,
        autorPublicacion: not.autorPublicacion,
        tipoNoticia_idtipoNoticia: not.tipoNoticia_idtipoNoticia,
      })
      .executeTakeFirst();
    return c.json({ rows: Number(result.insertId), status: 1, message: "La noticia ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-noticia/:id", async (c) => {
  try {
    await db
      .deleteFrom("noticia")
      .where("idNoticia", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "Eliminada la noticia" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-noticia", async (c) => {
  try {
    const not = await c.req.json();
    await db
      .updateTable("noticia")
      .set({
        titulo: not.titulo,
        tituloEN: not.tituloEN,
        resumen: not.resumen,
        resumenEN: not.resumenEN,
        cuerpo: not.cuerpo,
        cuerpoEN: not.cuerpoEN,
        fechaPublicacion: not.fechaPublicacion,
        estado: not.estado,
        autorPublicacion: not.autorPublicacion,
        tipoNoticia_idtipoNoticia: not.tipoNoticia_idtipoNoticia,
      })
      .where("idNoticia", "=", Number(not.idNoticia))
      .execute();
    return c.json({ status: 1, message: "La noticia ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-noticia-file/:id", checkToken, async (c) => {
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
        fs.writeFileSync("./uploads/noticia/" + file.name, buffer);
        await db
          .updateTable("noticia")
          .set({ foto: fotoName })
          .where("idNoticia", "=", Number(c.req.param("id")))
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

router.get("/get-image-noticia/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/noticia/" + imageFile;
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
