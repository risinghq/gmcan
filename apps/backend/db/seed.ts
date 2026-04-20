import { hashPassword } from "../lib/password.js";
import { db } from "./client.js";

const today = new Date().toISOString().split("T")[0];

export async function seed() {
  await db
    .insertInto("gender")
    .values([
      { id: 1, name: "Male", createdAt: today, updatedAt: today },
      { id: 2, name: "Female", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("prefix")
    .values([
      { id: 1, name: "Dr.", createdAt: today, updatedAt: today },
      { id: 2, name: "Dra.", createdAt: today, updatedAt: today },
      { id: 3, name: "Mg.", createdAt: today, updatedAt: today },
      { id: 4, name: "Lic.", createdAt: today, updatedAt: today },
      { id: 5, name: "Bach.", createdAt: today, updatedAt: today },
      { id: 6, name: "Ing.", createdAt: today, updatedAt: today },
      { id: 7, name: "-", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("role")
    .values([
      { id: 1, name: "Administrator", createdAt: today, updatedAt: today },
      { id: 2, name: "Researcher", createdAt: today, updatedAt: today },
      { id: 3, name: "Visitor", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("member_type")
    .values([
      {
        id: 1,
        name: "Investigadores",
        nameEN: "Researchers",
        nameSingular: "Investigador",
        nameSingularEN: "Researcher",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 2,
        name: "Estudiantes de Doctorado",
        nameEN: "PhD Students",
        nameSingular: "Estudiante de Doctorado",
        nameSingularEN: "PhD Student",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 3,
        name: "Estudiantes de Maestría",
        nameEN: "Master Students",
        nameSingular: "Estudiante de Maestría",
        nameSingularEN: "Master Student",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 4,
        name: "Estudiantes de Pregrado",
        nameEN: "Undergraduate Students",
        nameSingular: "Estudiante de Pregrado",
        nameSingularEN: "Undergraduate Student",
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 5,
        name: "Colaboradores",
        nameEN: "Collaborators",
        nameSingular: "Colaborador",
        nameSingularEN: "Collaborator",
        createdAt: today,
        updatedAt: today,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_type")
    .values([
      { id: 1, name: "Journal Article", nameEN: "Journal Article", createdAt: today, updatedAt: today },
      { id: 2, name: "Conference Paper", nameEN: "Conference Paper", createdAt: today, updatedAt: today },
      { id: 3, name: "Thesis", nameEN: "Thesis", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("thesis_type")
    .values([
      { id: 1, name: "PhD", nameEN: "PhD", createdAt: today, updatedAt: today },
      { id: 2, name: "Master's", nameEN: "Master's", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("news_type")
    .values([
      { id: 1, name: "General", nameEN: "General", createdAt: today, updatedAt: today },
      { id: 2, name: "Research", nameEN: "Research", createdAt: today, updatedAt: today },
      { id: 3, name: "Event", nameEN: "Event", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("currency")
    .values([
      { id: 1, symbol: "S/" },
      { id: 2, symbol: "$" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("research_group")
    .values([
      {
        id: 1,
        summaryES: "Grupo de investigación de la UNMSM.",
        summaryEN: "Research group of UNMSM.",
        name: "GMCAN",
        fullName: "Grupo de Minería de Conocimiento y Análisis de Negocios",
        createdAt: today,
        updatedAt: today,
        address: null,
        email: null,
        phone: null,
        facilitiesPhoto: null,
        facilitiesES: null,
        facilitiesEN: null,
        futureWorkES: null,
        futureWorkEN: null,
        logoFooter: null,
        logoHeader: null,
        publicationsSectionES: null,
        publicationsSectionEN: null,
        projectsSectionES: null,
        projectsSectionEN: null,
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  const existing = await db.selectFrom("member").select("id").executeTakeFirst();
  if (!existing) {
    await db
      .insertInto("member")
      .values({
        dni: "00000001",
        email: "admin@gmcan.dev",
        password: hashPassword("admin1234"),
        firstName: "Admin",
        lastName: "Dev",
        maternalName: null,
        status: 1,
        resetPassword: 0,
        roleId: 1,
        memberTypeId: 1,
        prefixId: null,
        genderId: null,
        createdAt: today,
        updatedAt: today,
        birthDate: null,
        bio: null,
        bioEN: null,
        photo: null,
        resetToken: null,
        resetExpires: null,
      })
      .execute();
  }
}
