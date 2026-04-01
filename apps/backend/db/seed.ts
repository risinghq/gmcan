import { hashPassword } from "../lib/password.js";
import { db } from "./client.js";

const today = new Date().toISOString().split("T")[0];

export async function seed() {
  // Insert reference data using onConflict().doNothing() so re-runs are safe.

  await db
    .insertInto("genero")
    .values([
      { idGenero: 1, nombre: "Masculino", fechaCreacion: today, fechaActualizacion: today },
      { idGenero: 2, nombre: "Femenino", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("prefijo")
    .values([
      { idPrefijo: 1, nombre: "Dr.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 2, nombre: "Dra.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 3, nombre: "Mg.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 4, nombre: "Lic.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 5, nombre: "Bach.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 6, nombre: "Ing.", fechaCreacion: today, fechaActualizacion: today },
      { idPrefijo: 7, nombre: "-", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("tipousuario")
    .values([
      { idTipoUsuario: 1, nombre: "Administrador", fechaCreacion: today, fechaActualizacion: today },
      { idTipoUsuario: 2, nombre: "Investigador", fechaCreacion: today, fechaActualizacion: today },
      { idTipoUsuario: 3, nombre: "Visitante", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("tipomiembro")
    .values([
      {
        idTipoMiembro: 1,
        nombre: "Investigadores",
        nombreEN: "Researchers",
        nombreSingular: "Investigador",
        nombreSingularEN: "Researcher",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      {
        idTipoMiembro: 2,
        nombre: "Estudiantes de Doctorado",
        nombreEN: "PhD Students",
        nombreSingular: "Estudiante de Doctorado",
        nombreSingularEN: "PhD Student",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      {
        idTipoMiembro: 3,
        nombre: "Estudiantes de Maestría",
        nombreEN: "Master Students",
        nombreSingular: "Estudiante de Maestría",
        nombreSingularEN: "Master Student",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      {
        idTipoMiembro: 4,
        nombre: "Estudiantes de Pregrado",
        nombreEN: "Undergraduate Students",
        nombreSingular: "Estudiante de Pregrado",
        nombreSingularEN: "Undergraduate Student",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      {
        idTipoMiembro: 5,
        nombre: "Colaboradores",
        nombreEN: "Collaborators",
        nombreSingular: "Colaborador",
        nombreSingularEN: "Collaborator",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("tipopublicacion")
    .values([
      {
        idTipoPublicacion: 1,
        nombre: "Artículo de Revista",
        nombreEN: "Journal Article",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      {
        idTipoPublicacion: 2,
        nombre: "Ponencia en Conferencia",
        nombreEN: "Conference Paper",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      { idTipoPublicacion: 3, nombre: "Tesis", nombreEN: "Thesis", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("tipotesis")
    .values([
      { idTipoTesis: 1, nombre: "Doctorado", nombreEN: "PhD", fechaCreacion: today, fechaActualizacion: today },
      { idTipoTesis: 2, nombre: "Maestría", nombreEN: "Master's", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("tiponoticia")
    .values([
      { idtipoNoticia: 1, nombre: "General", nombreEN: "General", fechaCreacion: today, fechaActualizacion: today },
      {
        idtipoNoticia: 2,
        nombre: "Investigación",
        nombreEN: "Research",
        fechaCreacion: today,
        fechaActualizacion: today,
      },
      { idtipoNoticia: 3, nombre: "Evento", nombreEN: "Event", fechaCreacion: today, fechaActualizacion: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("moneda")
    .values([
      { idMoneda: 1, simbolo: "S/" },
      { idMoneda: 2, simbolo: "$" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("grupo")
    .values([
      {
        idGrupo: 1,
        quienesSomosResumen: "Grupo de investigación de la UNMSM.",
        quienesSomosResumenEN: "Research group of UNMSM.",
        nombreGrupo: "GMCAN",
        nombreGrupo2: "Grupo de Minería de Conocimiento y Análisis de Negocios",
        fechaCreacion: today,
        fechaActualizacion: today,
        direccion: null,
        correo: null,
        telefono: null,
        facilidadesRecursosFoto: null,
        facilidadesRecursos: null,
        facilidadesRecursosEN: null,
        trabajosFuturos: null,
        trabajosFuturosEN: null,
        logoFooter: null,
        logoHeader: null,
        seccionPublicaciones: null,
        seccionPublicacionesEN: null,
        seccionProyectos: null,
        seccionProyectosEN: null,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  // Seed admin user only if no users exist yet
  const existing = await db.selectFrom("usuario").select("DNI").executeTakeFirst();
  if (!existing) {
    await db
      .insertInto("usuario")
      .values({
        DNI: "00000001",
        correo: "admin@gmcan.dev",
        password: hashPassword("admin1234"),
        nombre: "Admin",
        apellidoPaterno: "Dev",
        apellidoMaterno: null,
        estado: 1,
        restablecer: 0,
        tipoUsuario_idTipoUsuario: 1,
        tipoMiembro_idTipoMiembro: 1,
        prefijo_idPrefijo: null,
        genero_idGenero: null,
        fechaCreacion: today,
        fechaActualizacion: today,
        fechaNacimiento: null,
        resumenPro: null,
        resumenProEN: null,
        foto: null,
        reset_token: null,
        reset_expires: null,
      })
      .execute();
  }
}
