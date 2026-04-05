import { sql } from "kysely";

import { db } from "./client.js";
import { USUARIO_PUBLIC } from "./projections.js";

export interface AuthorEntry {
  kind: "registered" | "external";
  DNI?: string;
  nombre: string;
  foto?: string | null;
  isPrincipal: number;
}

export async function publicacionWithAuthors(id: number): Promise<{
  publicacion: Record<string, unknown>;
  autores: AuthorEntry[];
}> {
  const [publicacion, rows] = await Promise.all([
    db.selectFrom("publicacion").selectAll().where("idPublicacion", "=", id).executeTakeFirst(),
    db
      .selectFrom("publicacion_has_autor")
      .leftJoin("usuario", "usuario.DNI", "publicacion_has_autor.usuario_DNI")
      .select([
        "publicacion_has_autor.isPrincipal",
        "publicacion_has_autor.nombre",
        "publicacion_has_autor.usuario_DNI",
        sql<string>`usuario.nombre`.as("userNombre"),
        sql<string>`usuario.apellidoPaterno`.as("userApellidoPaterno"),
        sql<string | null>`usuario.apellidoMaterno`.as("userApellidoMaterno"),
        sql<string | null>`usuario.foto`.as("userFoto"),
      ])
      .where("publicacion_has_autor.publicacion_idPublicacion", "=", id)
      .orderBy("publicacion_has_autor.isPrincipal", "asc")
      .execute(),
  ]);

  const autores: AuthorEntry[] = rows.map((row) => {
    if (row.usuario_DNI) {
      return {
        kind: "registered" as const,
        DNI: row.usuario_DNI,
        nombre:
          `${row.userNombre ?? ""} ${row.userApellidoPaterno ?? ""}${row.userApellidoMaterno ? " " + row.userApellidoMaterno : ""}`.trim(),
        foto: row.userFoto ?? null,
        isPrincipal: row.isPrincipal,
      };
    }
    return {
      kind: "external" as const,
      nombre: row.nombre ?? "",
      isPrincipal: row.isPrincipal,
    };
  });

  return { publicacion: publicacion as Record<string, unknown>, autores };
}

export async function memberProjects(dni: string) {
  return db
    .selectFrom("proyecto")
    .innerJoin("usuario_has_proyecto", "usuario_has_proyecto.proyecto_idProyecto", "proyecto.idProyecto")
    .selectAll("proyecto")
    .where("usuario_has_proyecto.usuario_DNI", "=", dni)
    .execute();
}

export async function memberPublications(dni: string) {
  return db
    .selectFrom("publicacion")
    .innerJoin("publicacion_has_autor", "publicacion_has_autor.publicacion_idPublicacion", "publicacion.idPublicacion")
    .selectAll("publicacion")
    .where("publicacion_has_autor.usuario_DNI", "=", dni)
    .execute();
}

export async function publicProfile(dni: string) {
  const [usuario, proyectos, publicaciones] = await Promise.all([
    db.selectFrom("usuario").select(USUARIO_PUBLIC).where("DNI", "=", dni).executeTakeFirst(),
    memberProjects(dni),
    memberPublications(dni),
  ]);
  return { usuario, proyectos, publicaciones };
}
