import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { checkToken } from "../auth/token_validation.js";
import { db } from "../db/client.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Body = z.object({
  titulo: z.string().min(1),
  tituloEN: z.string().optional(),
  codigo: z.string().min(1),
  montoFinanciado: z.string(),
  descripcion: z.string(),
  descripcionEN: z.string().optional(),
  estado: z.number().int().optional(),
  fechaI: z.string(),
  fechaF: z.string().optional(),
  lineasInvestigacion_idLineasInvestigacion: z.number().int(),
  moneda_idMoneda: z.number().int(),
  fuenteFinanciamiento_idFuenteFinanciamiento: z.number().int(),
});

const UpdateBody = Body.extend({ idProyecto: z.number().int() });

router.get("/get-proyecto", async (c) => {
  const rows = await db.selectFrom("proyecto").selectAll().execute();
  return c.json(rows);
});

router.get("/get-proyecto/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("proyecto").selectAll().where("idProyecto", "=", id).execute();
  return c.json(rows);
});

router.get("/get-proyectos/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db.selectFrom("proyecto").selectAll().where("estado", "=", id).execute();
  return c.json(rows);
});

router.get("/get-proyectofuente/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await db
    .selectFrom("proyecto")
    .selectAll()
    .where("fuenteFinanciamiento_idFuenteFinanciamiento", "=", id)
    .execute();
  return c.json(rows);
});

router.post(
  "/search-proyecto",
  zValidator("json", z.object({ nombre: z.string(), estado: z.number().int() })),
  async (c) => {
    const { nombre, estado } = c.req.valid("json");
    const term = `%${nombre}%`;
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where((eb) =>
        eb
          .or([eb("titulo", "like", term), eb("tituloEN", "like", term), eb("codigo", "like", term)])
          .and(eb("estado", "=", estado)),
      )
      .execute();
    return c.json(rows);
  },
);

router.post("/search-proyecto-global", zValidator("json", z.object({ nombre: z.string() })), async (c) => {
  const { nombre } = c.req.valid("json");
  const term = `%${nombre}%`;
  const rows = await db
    .selectFrom("proyecto")
    .selectAll()
    .where((eb) =>
      eb
        .or([
          eb("titulo", "like", term),
          eb("tituloEN", "like", term),
          eb("codigo", "like", term),
          eb("descripcion", "like", term),
          eb("descripcionEN", "like", term),
        ])
        .and(eb("estado", "=", 1)),
    )
    .execute();
  return c.json(rows);
});

router.post(
  "/get-proyectolinea",
  zValidator(
    "json",
    z.object({
      lineasInvestigacion_idLineasInvestigacion: z.number().int(),
      estado: z.number().int(),
    }),
  ),
  async (c) => {
    const { lineasInvestigacion_idLineasInvestigacion, estado } = c.req.valid("json");
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("lineasInvestigacion_idLineasInvestigacion", "=", lineasInvestigacion_idLineasInvestigacion)
      .where("estado", "=", estado)
      .execute();
    return c.json(rows);
  },
);

router.post(
  "/get-proyectoid",
  zValidator("json", z.object({ idProyecto: z.number().int(), estado: z.number().int() })),
  async (c) => {
    const { idProyecto, estado } = c.req.valid("json");
    const rows = await db
      .selectFrom("proyecto")
      .selectAll()
      .where("idProyecto", "=", idProyecto)
      .where("estado", "=", estado)
      .execute();
    return c.json(rows);
  },
);

router.post("/post-proyecto", checkToken, zValidator("json", Body), async (c) => {
  const { fechaI, fechaF, ...rest } = c.req.valid("json");
  const result = await db
    .insertInto("proyecto")
    .values({ ...rest, fechaInicio: fechaI, fechaFin: fechaF ?? null })
    .executeTakeFirst();
  return c.json({ idProyecto: Number(result.insertId) }, 201);
});

router.delete("/delete-proyecto/:id", checkToken, zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await db.deleteFrom("proyecto").where("idProyecto", "=", id).execute();
  return c.json({ status: 1 });
});

router.put("/update-proyecto", checkToken, zValidator("json", UpdateBody), async (c) => {
  const { idProyecto, fechaI, fechaF, ...rest } = c.req.valid("json");
  await db
    .updateTable("proyecto")
    .set({ ...rest, fechaInicio: fechaI, fechaFin: fechaF ?? null })
    .where("idProyecto", "=", idProyecto)
    .execute();
  return c.json({ status: 1 });
});

router.put(
  "/end-proyecto",
  checkToken,
  zValidator("json", z.object({ idProyecto: z.number().int(), estado: z.number().int() })),
  async (c) => {
    const { idProyecto, estado } = c.req.valid("json");
    const fechaFin = new Date().toISOString().slice(0, 10);
    await db.updateTable("proyecto").set({ fechaFin, estado }).where("idProyecto", "=", idProyecto).execute();
    return c.json({ status: 1 });
  },
);

router.put(
  "/restart-proyecto",
  checkToken,
  zValidator("json", z.object({ idProyecto: z.number().int(), estado: z.number().int() })),
  async (c) => {
    const { idProyecto, estado } = c.req.valid("json");
    await db.updateTable("proyecto").set({ fechaFin: null, estado }).where("idProyecto", "=", idProyecto).execute();
    return c.json({ status: 1 });
  },
);

export default router;
