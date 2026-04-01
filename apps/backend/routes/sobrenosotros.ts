import fs from "node:fs";
import path from "node:path";

import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

router.get("/get-sobrenosotros", async (c) => {
  try {
    const rows = await db.selectFrom("sobrenosotros").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-sobrenosotros-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("sobrenosotros")
      .select([
        "idSobreNosotros",
        (eb) => eb.ref("quienesSomosEN").as("quienesSomos"),
        (eb) => eb.ref("objetivosEN").as("objetivos"),
        (eb) => eb.ref("serviciosEN").as("servicios"),
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-descripciongrupo", async (c) => {
  try {
    const sobrenosotros = await c.req.json();
    await db
      .updateTable("sobrenosotros")
      .set({
        quienesSomos: sobrenosotros.quienesSomos,
        quienesSomosEN: sobrenosotros.quienesSomosEN,
      })
      .where("idSobreNosotros", "=", Number(sobrenosotros.idSobreNosotros))
      .execute();
    return c.json({ status: 1, message: "Ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-objetivosgrupo", checkToken, async (c) => {
  try {
    const sobrenosotros = await c.req.json();
    await db
      .updateTable("sobrenosotros")
      .set({
        objetivos: sobrenosotros.objetivos,
        objetivosEN: sobrenosotros.objetivosEN,
      })
      .where("idSobreNosotros", "=", Number(sobrenosotros.idSobreNosotros))
      .execute();
    return c.json({ status: 1, message: "Ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-serviciosgrupo", checkToken, async (c) => {
  try {
    const sobrenosotros = await c.req.json();
    await db
      .updateTable("sobrenosotros")
      .set({
        servicios: sobrenosotros.servicios,
        serviciosEN: sobrenosotros.serviciosEN,
      })
      .where("idSobreNosotros", "=", Number(sobrenosotros.idSobreNosotros))
      .execute();
    return c.json({ status: 1, message: "Ha sido actualizado" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/upload-sobrenosotros-foto/:id", checkToken, async (c) => {
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
        fs.writeFileSync("./uploads/sobrenosotros/" + file.name, buffer);
        await db
          .updateTable("sobrenosotros")
          .set({ foto: fotoName })
          .where("idSobreNosotros", "=", Number(c.req.param("id")))
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

router.get("/get-image-sobrenosotros/:imageFile", async (c) => {
  const imageFile = c.req.param("imageFile");
  const path_file = "./uploads/sobrenosotros/" + imageFile;
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
