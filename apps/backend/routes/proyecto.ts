import { Hono } from "hono";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();

const proyectoEnSelect = [
  "idProyecto",
  (eb: any) => eb.ref("tituloEN").as("titulo"),
  "codigo",
  "montoFinanciado",
  (eb: any) => eb.ref("descripcionEN").as("descripcion"),
  "estado",
  "fechaInicio",
  "fechaFin",
  "lineasInvestigacion_idLineasInvestigacion",
  "moneda_idMoneda",
  "fuenteFinanciamiento_idFuenteFinanciamiento",
] as const;

router.get("/get-proyecto", async (c) => {
  try {
    const rows = await db.selectFrom("proyecto").selectAll().execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyecto-en", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyecto/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("idProyecto", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyecto-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where("idProyecto", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyectos/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("estado", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyectos-en/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where("estado", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-proyecto", async (c) => {
  try {
    const proyecto = await c.req.json();
    const nombreTerm = "%" + proyecto.nombre + "%";
    const codigoTerm = "%" + proyecto.nombre + "%";
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where((eb) =>
        eb
          .or([eb("titulo", "like", nombreTerm), eb("codigo", "like", codigoTerm)])
          .and(eb("estado", "=", proyecto.estado)),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-proyecto-en", async (c) => {
  try {
    const proyecto = await c.req.json();
    const nombreTerm = "%" + proyecto.nombre + "%";
    const codigoTerm = "%" + proyecto.nombre + "%";
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where((eb) =>
        eb
          .or([eb("tituloEN", "like", nombreTerm), eb("codigo", "like", codigoTerm)])
          .and(eb("estado", "=", proyecto.estado)),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-proyecto-global", async (c) => {
  try {
    const proyecto = await c.req.json();
    const term = "%" + proyecto.nombre + "%";
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where((eb) =>
        eb
          .or([eb("titulo", "like", term), eb("codigo", "like", term), eb("descripcion", "like", term)])
          .and(eb("estado", "=", 1)),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/search-proyecto-global-en", async (c) => {
  try {
    const proyecto = await c.req.json();
    const term = "%" + proyecto.nombre + "%";
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where((eb) =>
        eb
          .or([eb("tituloEN", "like", term), eb("codigo", "like", term), eb("descripcionEN", "like", term)])
          .and(eb("estado", "=", 1)),
      )
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/get-proyectolinea", async (c) => {
  try {
    const proyecto = await c.req.json();
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where(
        "lineasInvestigacion_idLineasInvestigacion",
        "=",
        Number(proyecto.lineasInvestigacion_idLineasInvestigacion),
      )
      .where("estado", "=", proyecto.estado)
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/get-proyectolinea-en", async (c) => {
  try {
    const proyecto = await c.req.json();
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where(
        "lineasInvestigacion_idLineasInvestigacion",
        "=",
        Number(proyecto.lineasInvestigacion_idLineasInvestigacion),
      )
      .where("estado", "=", proyecto.estado)
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.get("/get-proyectofuente/:id", async (c) => {
  try {
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("fuenteFinanciamiento_idFuenteFinanciamiento", "=", Number(c.req.param("id")))
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/get-proyectoid", async (c) => {
  try {
    const proyecto = await c.req.json();
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("idProyecto", "=", Number(proyecto.idProyecto))
      .where("estado", "=", proyecto.estado)
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/get-proyectoid-en", async (c) => {
  try {
    const proyecto = await c.req.json();
    const rows = await db
      .selectFrom("proyecto")
      .select([
        "idProyecto",
        (eb) => eb.ref("tituloEN").as("titulo"),
        "codigo",
        "montoFinanciado",
        (eb) => eb.ref("descripcionEN").as("descripcion"),
        "estado",
        "fechaInicio",
        "fechaFin",
        "lineasInvestigacion_idLineasInvestigacion",
        "moneda_idMoneda",
        "fuenteFinanciamiento_idFuenteFinanciamiento",
      ])
      .where("idProyecto", "=", Number(proyecto.idProyecto))
      .where("estado", "=", proyecto.estado)
      .execute();
    return c.json(rows);
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.post("/post-proyecto", checkToken, async (c) => {
  try {
    const proyecto = await c.req.json();
    const result = await db
      .insertInto("proyecto")
      .values({
        titulo: proyecto.titulo,
        tituloEN: proyecto.tituloEN,
        codigo: proyecto.codigo,
        montoFinanciado: proyecto.montoFinanciado,
        descripcion: proyecto.descripcion,
        descripcionEN: proyecto.descripcionEN,
        estado: proyecto.estado,
        fechaInicio: proyecto.fechaI,
        fechaFin: proyecto.fechaF,
        lineasInvestigacion_idLineasInvestigacion: proyecto.lineasInvestigacion_idLineasInvestigacion,
        moneda_idMoneda: proyecto.moneda_idMoneda,
        fuenteFinanciamiento_idFuenteFinanciamiento: proyecto.fuenteFinanciamiento_idFuenteFinanciamiento,
      })
      .executeTakeFirst();
    return c.json({ status: 1, idProyecto: Number(result.insertId), message: "El proyecto ha sido guardada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.delete("/delete-proyecto/:id", checkToken, async (c) => {
  try {
    await db
      .deleteFrom("proyecto")
      .where("idProyecto", "=", Number(c.req.param("id")))
      .execute();
    return c.json({ status: 1, message: "El publicacion_has_usuario ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/update-proyecto", checkToken, async (c) => {
  try {
    const proyecto = await c.req.json();
    await db
      .updateTable("proyecto")
      .set({
        titulo: proyecto.titulo,
        tituloEN: proyecto.tituloEN,
        codigo: proyecto.codigo,
        montoFinanciado: proyecto.montoFinanciado,
        descripcion: proyecto.descripcion,
        descripcionEN: proyecto.descripcionEN,
        estado: proyecto.estado,
        fechaInicio: proyecto.fechaI,
        fechaFin: proyecto.fechaF,
        lineasInvestigacion_idLineasInvestigacion: proyecto.lineasInvestigacion_idLineasInvestigacion,
        moneda_idMoneda: proyecto.moneda_idMoneda,
        fuenteFinanciamiento_idFuenteFinanciamiento: proyecto.fuenteFinanciamiento_idFuenteFinanciamiento,
      })
      .where("idProyecto", "=", Number(proyecto.idProyecto))
      .execute();
    return c.json({ status: 1, message: "El proyecto ha sido actualizada" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/end-proyecto", checkToken, async (c) => {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const fechaF = `${yyyy}-${mm}-${dd}`;
    const proyecto = await c.req.json();
    await db
      .updateTable("proyecto")
      .set({ fechaFin: fechaF, estado: proyecto.estado })
      .where("idProyecto", "=", Number(proyecto.idProyecto))
      .execute();
    return c.json({ status: 1, message: "El proyecto ha sido concluido" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

router.put("/restart-proyecto", checkToken, async (c) => {
  try {
    const proyecto = await c.req.json();
    await db
      .updateTable("proyecto")
      .set({ fechaFin: null, estado: proyecto.estado })
      .where("idProyecto", "=", Number(proyecto.idProyecto))
      .execute();
    return c.json({ status: 1, message: "El proyecto ha sido concluido" });
  } catch (err) {
    console.log(err);
    return c.json({ error: "Database error" }, 500);
  }
});

export default router;
