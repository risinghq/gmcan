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
      { id: 1, name: "Investigadores", nameSingular: "Investigador" },
      { id: 2, name: "Estudiantes de Doctorado", nameSingular: "Estudiante de Doctorado" },
      { id: 3, name: "Estudiantes de Maestría", nameSingular: "Estudiante de Maestría" },
      { id: 4, name: "Estudiantes de Pregrado", nameSingular: "Estudiante de Pregrado" },
      { id: 5, name: "Colaboradores", nameSingular: "Colaborador" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("member_type_translation")
    .values([
      { memberTypeId: 1, locale: "es", name: "Investigadores", nameSingular: "Investigador" },
      { memberTypeId: 1, locale: "en", name: "Researchers", nameSingular: "Researcher" },
      { memberTypeId: 2, locale: "es", name: "Estudiantes de Doctorado", nameSingular: "Estudiante de Doctorado" },
      { memberTypeId: 2, locale: "en", name: "PhD Students", nameSingular: "PhD Student" },
      { memberTypeId: 3, locale: "es", name: "Estudiantes de Maestría", nameSingular: "Estudiante de Maestría" },
      { memberTypeId: 3, locale: "en", name: "Master Students", nameSingular: "Master Student" },
      { memberTypeId: 4, locale: "es", name: "Estudiantes de Pregrado", nameSingular: "Estudiante de Pregrado" },
      { memberTypeId: 4, locale: "en", name: "Undergraduate Students", nameSingular: "Undergraduate Student" },
      { memberTypeId: 5, locale: "es", name: "Colaboradores", nameSingular: "Colaborador" },
      { memberTypeId: 5, locale: "en", name: "Collaborators", nameSingular: "Collaborator" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedPublicationType() {
  await db
    .insertInto("publication_type")
    .values([
      { id: 1, name: "Journal Article" },
      { id: 2, name: "Conference Paper" },
      { id: 3, name: "Thesis" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("publication_type_translation")
    .values([
      { publicationTypeId: 1, locale: "es", name: "Journal Article" },
      { publicationTypeId: 1, locale: "en", name: "Journal Article" },
      { publicationTypeId: 2, locale: "es", name: "Conference Paper" },
      { publicationTypeId: 2, locale: "en", name: "Conference Paper" },
      { publicationTypeId: 3, locale: "es", name: "Thesis" },
      { publicationTypeId: 3, locale: "en", name: "Thesis" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedThesisType() {
  await db
    .insertInto("thesis_type")
    .values([
      { id: 1, name: "PhD" },
      { id: 2, name: "Master's" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("thesis_type_translation")
    .values([
      { thesisTypeId: 1, locale: "es", name: "PhD" },
      { thesisTypeId: 1, locale: "en", name: "PhD" },
      { thesisTypeId: 2, locale: "es", name: "Master's" },
      { thesisTypeId: 2, locale: "en", name: "Master's" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();
}

async function seedNewsType() {
  await db
    .insertInto("news_type")
    .values([
      { id: 1, name: "General" },
      { id: 2, name: "Research" },
      { id: 3, name: "Event" },
    ])
    .onConflict((oc) => oc.doNothing())
    .execute();

  await db
    .insertInto("news_type_translation")
    .values([
      { newsTypeId: 1, locale: "es", name: "General" },
      { newsTypeId: 1, locale: "en", name: "General" },
      { newsTypeId: 2, locale: "es", name: "Research" },
      { newsTypeId: 2, locale: "en", name: "Research" },
      { newsTypeId: 3, locale: "es", name: "Event" },
      { newsTypeId: 3, locale: "en", name: "Event" },
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
