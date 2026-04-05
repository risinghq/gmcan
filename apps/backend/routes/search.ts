import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sql } from "kysely";
import { z } from "zod";

import { db } from "../db/client.js";
import { USUARIO_PUBLIC } from "../db/projections.js";

const router = new Hono();

const SearchQuery = z.object({
  q: z.string().default(""),
  types: z.string().default("publications,members,news,projects"),
});

router.get("/", zValidator("query", SearchQuery), async (c) => {
  const { q, types } = c.req.valid("query");
  const term = q.trim();

  if (term.length < 2) {
    return c.json({ publications: [], members: [], news: [], projects: [] });
  }

  const like = `%${term}%`;
  const requested = new Set(types.split(",").map((t) => t.trim()));

  const [publicationRows, members, news, projectRows] = await Promise.all([
    requested.has("publications")
      ? db
          .selectFrom("publicacion")
          .selectAll()
          .where((eb) =>
            eb.or([eb("titulo", "like", like), eb("resumen", "like", like), eb("resumenEN", "like", like)]),
          )
          .execute()
      : Promise.resolve([]),
    requested.has("members")
      ? db
          .selectFrom("usuario")
          .select(USUARIO_PUBLIC)
          .where((eb) =>
            eb.or([
              eb("nombre", "like", like),
              eb("apellidoPaterno", "like", like),
              eb("apellidoMaterno", "like", like),
              eb("correo", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
    requested.has("news")
      ? db
          .selectFrom("noticia")
          .leftJoin("usuario", "usuario.DNI", "noticia.autorPublicacion")
          .select([
            "noticia.idNoticia",
            "noticia.titulo",
            "noticia.fechaPublicacion",
            "noticia.foto",
            "noticia.autorPublicacion",
            "noticia.tipoNoticia_idtipoNoticia",
            "noticia.estado",
            sql<string>`TRIM(CONCAT(COALESCE(usuario.nombre, ''), ' ', COALESCE(usuario.apellidoPaterno, '')))`.as(
              "autor",
            ),
          ])
          .where((eb) =>
            eb.or([eb("titulo", "like", like), eb("resumen", "like", like), eb("resumenEN", "like", like)]),
          )
          .execute()
      : Promise.resolve([]),
    requested.has("projects")
      ? db
          .selectFrom("proyecto")
          .innerJoin(
            "lineasinvestigacion",
            "lineasinvestigacion.idLineasInvestigacion",
            "proyecto.lineasInvestigacion_idLineasInvestigacion",
          )
          .innerJoin(
            "fuentefinanciamiento",
            "fuentefinanciamiento.idFuenteFinanciamiento",
            "proyecto.fuenteFinanciamiento_idFuenteFinanciamiento",
          )
          .select([
            "proyecto.idProyecto",
            "proyecto.titulo",
            "proyecto.tituloEN",
            "proyecto.codigo",
            "proyecto.montoFinanciado",
            "proyecto.descripcion",
            "proyecto.descripcionEN",
            "proyecto.estado",
            "proyecto.fechaInicio",
            "proyecto.fechaFin",
            "proyecto.lineasInvestigacion_idLineasInvestigacion",
            "proyecto.moneda_idMoneda",
            "proyecto.fuenteFinanciamiento_idFuenteFinanciamiento",
            sql<string>`lineasinvestigacion.nombre`.as("lineasInvestigacion"),
            sql<string>`fuentefinanciamiento.nombre`.as("fuenteFinanciamiento"),
          ])
          .where("proyecto.estado", "=", 1)
          .where((eb) =>
            eb.or([
              eb("proyecto.titulo", "like", like),
              eb("proyecto.tituloEN", "like", like),
              eb("proyecto.codigo", "like", like),
              eb("proyecto.descripcion", "like", like),
              eb("proyecto.descripcionEN", "like", like),
              eb("lineasinvestigacion.nombre", "like", like),
              eb("lineasinvestigacion.nombreEN", "like", like),
              eb("fuentefinanciamiento.nombre", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
  ]);

  const publicationIds = publicationRows.map((row) => row.idPublicacion);
  const publicationAuthors =
    publicationIds.length > 0
      ? await db
          .selectFrom("publicacion_has_autor")
          .leftJoin("usuario", "usuario.DNI", "publicacion_has_autor.usuario_DNI")
          .select([
            "publicacion_has_autor.publicacion_idPublicacion",
            "publicacion_has_autor.isPrincipal",
            "publicacion_has_autor.nombre",
            "publicacion_has_autor.usuario_DNI",
            sql<string>`usuario.nombre`.as("userNombre"),
            sql<string>`usuario.apellidoPaterno`.as("userApellidoPaterno"),
            sql<string | null>`usuario.apellidoMaterno`.as("userApellidoMaterno"),
            sql<string | null>`usuario.foto`.as("userFoto"),
          ])
          .where("publicacion_has_autor.publicacion_idPublicacion", "in", publicationIds)
          .orderBy("publicacion_has_autor.publicacion_idPublicacion", "asc")
          .orderBy("publicacion_has_autor.isPrincipal", "asc")
          .execute()
      : [];

  const authorsByPublication = new Map<
    number,
    { kind: "registered" | "external"; DNI?: string; nombre: string; foto?: string | null; isPrincipal: number }[]
  >();

  for (const row of publicationAuthors) {
    const entry = row.usuario_DNI
      ? {
          kind: "registered" as const,
          DNI: row.usuario_DNI,
          nombre:
            `${row.userNombre ?? ""} ${row.userApellidoPaterno ?? ""}${row.userApellidoMaterno ? " " + row.userApellidoMaterno : ""}`.trim(),
          foto: row.userFoto ?? null,
          isPrincipal: row.isPrincipal,
        }
      : {
          kind: "external" as const,
          nombre: row.nombre ?? "",
          isPrincipal: row.isPrincipal,
        };

    const current = authorsByPublication.get(row.publicacion_idPublicacion) ?? [];
    current.push(entry);
    authorsByPublication.set(row.publicacion_idPublicacion, current);
  }

  const publications = publicationRows.map((row) => {
    const base = { ...row };
    return Object.assign(base, {
      autor: authorsByPublication.get(row.idPublicacion) ?? [],
    });
  });

  const projectIds = projectRows.map((row) => row.idProyecto);
  const projectMembers =
    projectIds.length > 0
      ? await db
          .selectFrom("usuario_has_proyecto")
          .innerJoin("usuario", "usuario.DNI", "usuario_has_proyecto.usuario_DNI")
          .select([
            "usuario_has_proyecto.proyecto_idProyecto",
            "usuario.DNI",
            "usuario.nombre",
            "usuario.apellidoPaterno",
            "usuario.foto",
          ])
          .where("usuario_has_proyecto.proyecto_idProyecto", "in", projectIds)
          .execute()
      : [];

  const membersByProject = new Map<number, { DNI: string; nombreCompleto: string; foto: string | null }[]>();
  for (const row of projectMembers) {
    const current = membersByProject.get(row.proyecto_idProyecto) ?? [];
    const shortName = row.nombre.length > 0 ? `${row.nombre[0]}. ${row.apellidoPaterno}` : row.apellidoPaterno;
    current.push({
      DNI: row.DNI,
      nombreCompleto: shortName,
      foto: row.foto,
    });
    membersByProject.set(row.proyecto_idProyecto, current);
  }

  const projects = projectRows.map((row) => {
    const base = { ...row };
    return Object.assign(base, {
      usuario: membersByProject.get(row.idProyecto) ?? [],
    });
  });

  return c.json({ publications, members, news, projects });
});

export default router;
