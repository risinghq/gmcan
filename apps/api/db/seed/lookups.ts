import { db } from "../client.js";

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
      { id: 1, name: "Male" },
      { id: 2, name: "Female" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedPrefix() {
  await db
    .insertInto("prefix")
    .values([
      { id: 1, name: "Dr." },
      { id: 2, name: "Dra." },
      { id: 3, name: "Mg." },
      { id: 4, name: "Lic." },
      { id: 5, name: "Bach." },
      { id: 6, name: "Ing." },
      { id: 7, name: "-" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedRole() {
  await db
    .insertInto("role")
    .values([
      { id: 1, name: "Administrator" },
      { id: 2, name: "Researcher" },
      { id: 3, name: "Visitor" },
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
      },
      {
        id: 2,
        name: "Estudiantes de Doctorado",
        nameEN: "PhD Students",
        nameSingular: "Estudiante de Doctorado",
        nameSingularEN: "PhD Student",
      },
      {
        id: 3,
        name: "Estudiantes de Maestría",
        nameEN: "Master Students",
        nameSingular: "Estudiante de Maestría",
        nameSingularEN: "Master Student",
      },
      {
        id: 4,
        name: "Estudiantes de Pregrado",
        nameEN: "Undergraduate Students",
        nameSingular: "Estudiante de Pregrado",
        nameSingularEN: "Undergraduate Student",
      },
      {
        id: 5,
        name: "Colaboradores",
        nameEN: "Collaborators",
        nameSingular: "Colaborador",
        nameSingularEN: "Collaborator",
      },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedPublicationType() {
  await db
    .insertInto("publication_type")
    .values([
      { id: 1, name: "Journal Article", nameEN: "Journal Article" },
      { id: 2, name: "Conference Paper", nameEN: "Conference Paper" },
      { id: 3, name: "Thesis", nameEN: "Thesis" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedThesisType() {
  await db
    .insertInto("thesis_type")
    .values([
      { id: 1, name: "PhD", nameEN: "PhD" },
      { id: 2, name: "Master's", nameEN: "Master's" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedNewsType() {
  await db
    .insertInto("news_type")
    .values([
      { id: 1, name: "General", nameEN: "General" },
      { id: 2, name: "Research", nameEN: "Research" },
      { id: 3, name: "Event", nameEN: "Event" },
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
