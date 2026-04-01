import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-metodo", async (c) => {
  try {
    const rows = await db.selectFrom("metodo").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-metodo-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("metodo")
      .select([
        "idMetodo",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "foto",
        "fechaActualizacion",
        "grupo_idGrupo",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-metodo/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("metodo")
      .selectAll()
      .where("idMetodo", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-metodo-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("metodo")
      .select([
        "idMetodo",
        (eb) => eb.ref("nombreEN").as("nombre"),
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "foto",
        "fechaActualizacion",
        "grupo_idGrupo",
      ])
      .where("idMetodo", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-metodo", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    const result = await db
      .insertInto("metodo")
      .values({
        nombre: not.nombre,
        nombreEN: not.nombreEN,
        descripcion: not.descripcion,
        descripcionEN: not.descripcionEN,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .executeTakeFirst();
    return c.json({ status: 1, idMetodo: Number(result.insertId), message: "El método ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-metodo/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("metodo")
      .where("idMetodo", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "El método ha sido eliminado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-metodo", checkToken, async (c) => {
  try {
    const not = await c.req.json();
    await db
      .updateTable("metodo")
      .set({
        nombre: not.nombre,
        nombreEN: not.nombreEN,
        descripcion: not.descripcion,
        descripcionEN: not.descripcionEN,
        grupo_idGrupo: not.grupo_idGrupo,
      })
      .where("idMetodo", "=", Number(not.idMetodo))
      .execute();
    return c.json({ status: 1, message: "La metodo ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-metodo-foto/:id", checkToken, async (c) => {
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
        fs.writeFileSync("./uploads/metodos/" + file.name, buffer);
        await db
          .updateTable("metodo")
          .set({ foto: fotoName })
          .where("idMetodo", "=", Number(c.req.param("id")))
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

router.get("/get-image-metodo/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/metodos/" + imageFile;
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
