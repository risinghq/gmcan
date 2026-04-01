import type { Kysely } from "kysely";

import type { Database } from "./schema.js";

// Used by bootstrap to detect schema drift.
// Keep in sync with createTables below.
export const EXPECTED_COLUMNS: Record<string, readonly string[]> = {
  autor: ["idAutor", "nombre", "fechaCreacion", "fechaActualizacion"],
  equipo: ["idEquipo", "nombre", "cpu", "gpu", "ram", "hd", "grupo_idGrupo", "fechaCreacion", "fechaActualizacion"],
  evento: ["idEvento", "nombre", "ciudad", "pais", "ciudadEN", "paisEN"],
  fuentefinanciamiento: ["idFuenteFinanciamiento", "nombre"],
  genero: ["idGenero", "nombre", "fechaCreacion", "fechaActualizacion"],
  grupo: [
    "idGrupo",
    "quienesSomosResumenEN",
    "quienesSomosResumen",
    "direccion",
    "correo",
    "telefono",
    "nombreGrupo",
    "nombreGrupo2",
    "facilidadesRecursosFoto",
    "facilidadesRecursos",
    "facilidadesRecursosEN",
    "trabajosFuturos",
    "trabajosFuturosEN",
    "logoFooter",
    "logoHeader",
    "seccionPublicaciones",
    "seccionPublicacionesEN",
    "seccionProyectos",
    "seccionProyectosEN",
    "fechaCreacion",
    "fechaActualizacion",
  ],
  lineasinvestigacion: [
    "idLineasInvestigacion",
    "nombre",
    "nombreEN",
    "descripcion",
    "descripcionEN",
    "foto",
    "grupo_idGrupo",
    "fechaCreacion",
    "fechaActualizacion",
  ],
  metodo: [
    "idMetodo",
    "nombreEN",
    "nombre",
    "descripcion",
    "descripcionEN",
    "foto",
    "grupo_idGrupo",
    "fechaCreacion",
    "fechaActualizacion",
  ],
  moneda: ["idMoneda", "simbolo"],
  noticia: [
    "idNoticia",
    "titulo",
    "tituloEN",
    "resumen",
    "resumenEN",
    "cuerpo",
    "cuerpoEN",
    "estado",
    "fechaPublicacion",
    "fechaActualizacion",
    "fechaCreacion",
    "foto",
    "prioridad",
    "autorPublicacion",
    "tipoNoticia_idtipoNoticia",
  ],
  permiso: ["idPermiso", "nombre", "fechaCreacion", "fechaActualizacion"],
  prefijo: ["idPrefijo", "nombre", "fechaCreacion", "fechaActualizacion"],
  proyecto: [
    "idProyecto",
    "titulo",
    "tituloEN",
    "codigo",
    "montoFinanciado",
    "descripcion",
    "descripcionEN",
    "estado",
    "fechaInicio",
    "fechaFin",
    "fechaCreacion",
    "fechaActualizacion",
    "lineasInvestigacion_idLineasInvestigacion",
    "moneda_idMoneda",
    "fuenteFinanciamiento_idFuenteFinanciamiento",
  ],
  publicacion: [
    "idPublicacion",
    "titulo",
    "archivo",
    "resumen",
    "resumenEN",
    "nroRevista",
    "DOI",
    "fechaPublicacion",
    "fechaActualizacion",
    "fechaCreacion",
    "tipoPublicacion_idTipoPublicacion",
    "revista_idRevista",
    "universidad_idUniversidad",
    "evento_idEvento",
    "tipoTesis_idTipoTesis",
  ],
  publicacion_has_autor: [
    "autores_idAutor",
    "publicacion_idPublicacion",
    "fechaCreacion",
    "fechaActualizacion",
    "isPrincipal",
  ],
  publicacion_has_usuario: [
    "publicacion_idPublicacion",
    "usuario_DNI",
    "fechaCreacion",
    "fechaActualizacion",
    "isPrincipal",
  ],
  refresh_token: ["token", "userCorreo", "createdAt"],
  revista: ["idRevista", "nombre"],
  sobrenosotros: [
    "idSobreNosotros",
    "quienesSomos",
    "quienesSomosEN",
    "objetivos",
    "objetivosEN",
    "servicios",
    "serviciosEN",
    "fechaCreacion",
    "fechaActualizacion",
    "foto",
    "grupo_idGrupo",
  ],
  software: [
    "idSoftware",
    "nombre",
    "descripcion",
    "descripcionEN",
    "moreInfo",
    "grupo_idGrupo",
    "fechaCreacion",
    "fechaActualizacion",
  ],
  tipomiembro: [
    "idTipoMiembro",
    "nombre",
    "nombreEN",
    "nombreSingular",
    "nombreSingularEN",
    "fechaCreacion",
    "fechaActualizacion",
  ],
  tiponoticia: ["idtipoNoticia", "nombre", "nombreEN", "fechaCreacion", "fechaActualizacion"],
  tipopermiso: ["idTipoPermiso", "nombre", "fechaCreacion", "fechaActualizacion"],
  tipopublicacion: ["idTipoPublicacion", "nombre", "nombreEN", "fechaActualizacion", "fechaCreacion"],
  tipotesis: ["idTipoTesis", "nombre", "nombreEN", "fechaCreacion", "fechaActualizacion"],
  tipousuario: ["idTipoUsuario", "nombre", "fechaCreacion", "fechaActualizacion"],
  universidad: ["idUniversidad", "nombreEN", "nombre", "fechaCreacion", "fechaActualizacion"],
  usuario: [
    "DNI",
    "correo",
    "password",
    "nombre",
    "apellidoPaterno",
    "apellidoMaterno",
    "fechaNacimiento",
    "resumenPro",
    "resumenProEN",
    "foto",
    "estado",
    "restablecer",
    "fechaCreacion",
    "fechaActualizacion",
    "tipoUsuario_idTipoUsuario",
    "tipoMiembro_idTipoMiembro",
    "prefijo_idPrefijo",
    "genero_idGenero",
    "reset_token",
    "reset_expires",
  ],
  usuario_has_grupo: ["usuario_DNI", "grupo_idGrupo", "fechaCreacion", "fechaActualizacion"],
  usuario_has_proyecto: ["proyecto_idProyecto", "usuario_DNI", "fechaCreacion", "fechaActualizacion"],
  usuariohaspermiso: ["usuario_DNI", "permiso_idPermiso", "fechaCreacion", "fechaActualizacion"],
};

export async function createTables(db: Kysely<Database>) {
  // Leaf tables first (no FK deps), then tables that reference them

  await db.schema
    .createTable("genero")
    .ifNotExists()
    .addColumn("idGenero", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("prefijo")
    .ifNotExists()
    .addColumn("idPrefijo", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("tipousuario")
    .ifNotExists()
    .addColumn("idTipoUsuario", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("tipomiembro")
    .ifNotExists()
    .addColumn("idTipoMiembro", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("nombreSingular", "text", (c) => c.notNull())
    .addColumn("nombreSingularEN", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("tiponoticia")
    .ifNotExists()
    .addColumn("idtipoNoticia", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("tipopublicacion")
    .ifNotExists()
    .addColumn("idTipoPublicacion", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("tipotesis")
    .ifNotExists()
    .addColumn("idTipoTesis", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("tipopermiso")
    .ifNotExists()
    .addColumn("idTipoPermiso", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("permiso")
    .ifNotExists()
    .addColumn("idPermiso", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("autor")
    .ifNotExists()
    .addColumn("idAutor", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("evento")
    .ifNotExists()
    .addColumn("idEvento", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("ciudad", "text")
    .addColumn("pais", "text")
    .addColumn("ciudadEN", "text")
    .addColumn("paisEN", "text")
    .execute();

  await db.schema
    .createTable("fuentefinanciamiento")
    .ifNotExists()
    .addColumn("idFuenteFinanciamiento", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("moneda")
    .ifNotExists()
    .addColumn("idMoneda", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("simbolo", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("revista")
    .ifNotExists()
    .addColumn("idRevista", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("universidad")
    .ifNotExists()
    .addColumn("idUniversidad", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombreEN", "text")
    .addColumn("nombre", "text")
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("grupo")
    .ifNotExists()
    .addColumn("idGrupo", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("quienesSomosResumenEN", "text", (c) => c.notNull())
    .addColumn("quienesSomosResumen", "text", (c) => c.notNull())
    .addColumn("direccion", "text")
    .addColumn("correo", "text")
    .addColumn("telefono", "text")
    .addColumn("nombreGrupo", "text")
    .addColumn("nombreGrupo2", "text")
    .addColumn("facilidadesRecursosFoto", "text")
    .addColumn("facilidadesRecursos", "text")
    .addColumn("facilidadesRecursosEN", "text")
    .addColumn("trabajosFuturos", "text")
    .addColumn("trabajosFuturosEN", "text")
    .addColumn("logoFooter", "text")
    .addColumn("logoHeader", "text")
    .addColumn("seccionPublicaciones", "text")
    .addColumn("seccionPublicacionesEN", "text")
    .addColumn("seccionProyectos", "text")
    .addColumn("seccionProyectosEN", "text")
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("usuario")
    .ifNotExists()
    .addColumn("DNI", "text", (c) => c.primaryKey().notNull())
    .addColumn("correo", "text", (c) => c.notNull().unique())
    .addColumn("password", "text", (c) => c.notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("apellidoPaterno", "text", (c) => c.notNull())
    .addColumn("apellidoMaterno", "text")
    .addColumn("fechaNacimiento", "text")
    .addColumn("resumenPro", "text")
    .addColumn("resumenProEN", "text")
    .addColumn("foto", "text")
    .addColumn("estado", "integer", (c) => c.notNull())
    .addColumn("restablecer", "integer", (c) => c.notNull())
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("tipoUsuario_idTipoUsuario", "integer", (c) => c.notNull().references("tipousuario.idTipoUsuario"))
    .addColumn("tipoMiembro_idTipoMiembro", "integer", (c) => c.notNull().references("tipomiembro.idTipoMiembro"))
    .addColumn("prefijo_idPrefijo", "integer", (c) => c.references("prefijo.idPrefijo"))
    .addColumn("genero_idGenero", "integer", (c) => c.references("genero.idGenero"))
    .addColumn("reset_token", "text")
    .addColumn("reset_expires", "text")
    .execute();

  await db.schema
    .createTable("refresh_token")
    .ifNotExists()
    .addColumn("token", "text", (c) => c.primaryKey().notNull())
    .addColumn("userCorreo", "text", (c) => c.notNull())
    .addColumn("createdAt", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("lineasinvestigacion")
    .ifNotExists()
    .addColumn("idLineasInvestigacion", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("descripcion", "text")
    .addColumn("descripcionEN", "text")
    .addColumn("foto", "text")
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("metodo")
    .ifNotExists()
    .addColumn("idMetodo", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombreEN", "text", (c) => c.notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("descripcion", "text", (c) => c.notNull())
    .addColumn("descripcionEN", "text")
    .addColumn("foto", "text")
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("equipo")
    .ifNotExists()
    .addColumn("idEquipo", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text", (c) => c.notNull())
    .addColumn("cpu", "text")
    .addColumn("gpu", "text")
    .addColumn("ram", "text")
    .addColumn("hd", "text")
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("software")
    .ifNotExists()
    .addColumn("idSoftware", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("nombre", "text")
    .addColumn("descripcion", "text")
    .addColumn("descripcionEN", "text")
    .addColumn("moreInfo", "text")
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("sobrenosotros")
    .ifNotExists()
    .addColumn("idSobreNosotros", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("quienesSomos", "text", (c) => c.notNull())
    .addColumn("quienesSomosEN", "text", (c) => c.notNull())
    .addColumn("objetivos", "text")
    .addColumn("objetivosEN", "text")
    .addColumn("servicios", "text")
    .addColumn("serviciosEN", "text")
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("foto", "text")
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .execute();

  await db.schema
    .createTable("noticia")
    .ifNotExists()
    .addColumn("idNoticia", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("titulo", "text")
    .addColumn("tituloEN", "text")
    .addColumn("resumen", "text")
    .addColumn("resumenEN", "text")
    .addColumn("cuerpo", "text")
    .addColumn("cuerpoEN", "text")
    .addColumn("estado", "integer")
    .addColumn("fechaPublicacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("fechaCreacion", "text")
    .addColumn("foto", "text")
    .addColumn("prioridad", "integer")
    .addColumn("autorPublicacion", "text", (c) => c.references("usuario.DNI"))
    .addColumn("tipoNoticia_idtipoNoticia", "integer", (c) => c.references("tiponoticia.idtipoNoticia"))
    .execute();

  await db.schema
    .createTable("publicacion")
    .ifNotExists()
    .addColumn("idPublicacion", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("titulo", "text", (c) => c.notNull())
    .addColumn("archivo", "text")
    .addColumn("resumen", "text")
    .addColumn("resumenEN", "text")
    .addColumn("nroRevista", "integer")
    .addColumn("DOI", "text")
    .addColumn("fechaPublicacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text")
    .addColumn("fechaCreacion", "text")
    .addColumn("tipoPublicacion_idTipoPublicacion", "integer", (c) =>
      c.notNull().references("tipopublicacion.idTipoPublicacion"),
    )
    .addColumn("revista_idRevista", "integer", (c) => c.references("revista.idRevista"))
    .addColumn("universidad_idUniversidad", "integer", (c) => c.references("universidad.idUniversidad"))
    .addColumn("evento_idEvento", "integer", (c) => c.references("evento.idEvento"))
    .addColumn("tipoTesis_idTipoTesis", "integer", (c) => c.references("tipotesis.idTipoTesis"))
    .execute();

  await db.schema
    .createTable("proyecto")
    .ifNotExists()
    .addColumn("idProyecto", "integer", (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn("titulo", "text", (c) => c.notNull())
    .addColumn("tituloEN", "text")
    .addColumn("codigo", "text", (c) => c.notNull())
    .addColumn("montoFinanciado", "text", (c) => c.notNull())
    .addColumn("descripcion", "text", (c) => c.notNull())
    .addColumn("descripcionEN", "text")
    .addColumn("estado", "integer")
    .addColumn("fechaInicio", "text", (c) => c.notNull())
    .addColumn("fechaFin", "text")
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("lineasInvestigacion_idLineasInvestigacion", "integer", (c) =>
      c.notNull().references("lineasinvestigacion.idLineasInvestigacion"),
    )
    .addColumn("moneda_idMoneda", "integer", (c) => c.notNull().references("moneda.idMoneda"))
    .addColumn("fuenteFinanciamiento_idFuenteFinanciamiento", "integer", (c) =>
      c.notNull().references("fuentefinanciamiento.idFuenteFinanciamiento"),
    )
    .execute();

  await db.schema
    .createTable("publicacion_has_autor")
    .ifNotExists()
    .addColumn("autores_idAutor", "integer", (c) => c.notNull().references("autor.idAutor"))
    .addColumn("publicacion_idPublicacion", "integer", (c) => c.notNull().references("publicacion.idPublicacion"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("isPrincipal", "integer", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("publicacion_has_usuario")
    .ifNotExists()
    .addColumn("publicacion_idPublicacion", "integer", (c) => c.notNull().references("publicacion.idPublicacion"))
    .addColumn("usuario_DNI", "text", (c) => c.notNull().references("usuario.DNI"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .addColumn("isPrincipal", "integer", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("usuario_has_grupo")
    .ifNotExists()
    .addColumn("usuario_DNI", "text", (c) => c.notNull().references("usuario.DNI"))
    .addColumn("grupo_idGrupo", "integer", (c) => c.notNull().references("grupo.idGrupo"))
    .addColumn("fechaCreacion", "text", (c) => c.notNull())
    .addColumn("fechaActualizacion", "text", (c) => c.notNull())
    .execute();

  await db.schema
    .createTable("usuario_has_proyecto")
    .ifNotExists()
    .addColumn("proyecto_idProyecto", "integer", (c) => c.notNull().references("proyecto.idProyecto"))
    .addColumn("usuario_DNI", "text", (c) => c.notNull().references("usuario.DNI"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();

  await db.schema
    .createTable("usuariohaspermiso")
    .ifNotExists()
    .addColumn("usuario_DNI", "text", (c) => c.notNull().references("usuario.DNI"))
    .addColumn("permiso_idPermiso", "integer", (c) => c.notNull().references("permiso.idPermiso"))
    .addColumn("fechaCreacion", "text")
    .addColumn("fechaActualizacion", "text")
    .execute();
}
