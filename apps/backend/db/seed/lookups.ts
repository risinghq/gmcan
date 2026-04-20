import { db } from "../client.js";

const today = new Date().toISOString().split("T")[0];

export async function seedLookups() {
  await seedGender();
  await seedPrefix();
  await seedRole();
  await seedMemberType();
  await seedPublicationType();
  await seedThesisType();
  await seedNewsType();
  await seedCurrency();
  await seedFundingSource();
}

async function seedGender() {
  await db
    .insertInto("gender")
    .values([
      { id: 1, name: "Male", createdAt: today, updatedAt: today },
      { id: 2, name: "Female", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedPrefix() {
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
}

async function seedRole() {
  await db
    .insertInto("role")
    .values([
      { id: 1, name: "Administrator", createdAt: today, updatedAt: today },
      { id: 2, name: "Researcher", createdAt: today, updatedAt: today },
      { id: 3, name: "Visitor", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedMemberType() {
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
}

async function seedPublicationType() {
  await db
    .insertInto("publication_type")
    .values([
      { id: 1, name: "Journal Article", nameEN: "Journal Article", createdAt: today, updatedAt: today },
      { id: 2, name: "Conference Paper", nameEN: "Conference Paper", createdAt: today, updatedAt: today },
      { id: 3, name: "Thesis", nameEN: "Thesis", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedThesisType() {
  await db
    .insertInto("thesis_type")
    .values([
      { id: 1, name: "PhD", nameEN: "PhD", createdAt: today, updatedAt: today },
      { id: 2, name: "Master's", nameEN: "Master's", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedNewsType() {
  await db
    .insertInto("news_type")
    .values([
      { id: 1, name: "General", nameEN: "General", createdAt: today, updatedAt: today },
      { id: 2, name: "Research", nameEN: "Research", createdAt: today, updatedAt: today },
      { id: 3, name: "Event", nameEN: "Event", createdAt: today, updatedAt: today },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedCurrency() {
  await db
    .insertInto("currency")
    .values([
      { id: 1, symbol: "S/" },
      { id: 2, symbol: "$" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedFundingSource() {
  await db
    .insertInto("funding_source")
    .values([
      { id: 1, name: "VRIP" },
      { id: 2, name: "Sin fuente" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}
