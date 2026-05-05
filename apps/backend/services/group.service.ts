import { db } from "../db/client.js";
import type { MethodRow, ResearchLineRow } from "../db/schema.js";
import type { Bilingual } from "../lib/admin-translations.js";

export async function getGroup(id: number) {
  return db.selectFrom("research_group").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function listGroups() {
  return db.selectFrom("research_group").selectAll().execute();
}

export async function updateGroupInfo(id: number, data: { email?: string; phone?: string }) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupSummary(id: number, data: { summaryES: string; summaryEN: string }) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupFacilities(id: number, data: { facilitiesES?: string; facilitiesEN?: string }) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupFutureWork(id: number, data: { futureWorkES?: string; futureWorkEN?: string }) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupPublicationsSection(
  id: number,
  data: { publicationsSectionES?: string; publicationsSectionEN?: string },
) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupProjectsSection(
  id: number,
  data: { projectsSectionES?: string; projectsSectionEN?: string },
) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

// About (sobrenosotros)
export async function listAbout(groupId: number) {
  return db.selectFrom("about").selectAll().where("groupId", "=", groupId).execute();
}

export async function updateAboutDescription(id: number, data: { descriptionES: string; descriptionEN: string }) {
  await db.updateTable("about").set(data).where("id", "=", id).execute();
}

export async function updateAboutObjectives(id: number, data: { objectivesES?: string; objectivesEN?: string }) {
  await db.updateTable("about").set(data).where("id", "=", id).execute();
}

export async function updateAboutServices(id: number, data: { servicesES?: string; servicesEN?: string }) {
  await db.updateTable("about").set(data).where("id", "=", id).execute();
}

// Research lines
export async function listResearchLines(groupId?: number) {
  let query = db.selectFrom("research_line").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function getResearchLine(id: number) {
  return db.selectFrom("research_line").selectAll().where("id", "=", id).executeTakeFirst();
}

export function toAdminResearchLineView(row: ResearchLineRow) {
  return {
    id: row.id,
    photo: row.photo,
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: {
      es: { name: row.name, description: row.description ?? "" },
      en: { name: row.nameEN, description: row.descriptionEN ?? "" },
    },
  };
}

export async function createResearchLine(data: {
  groupId: number;
  translations: Bilingual<{ name: string; description?: string }>;
}) {
  const result = await db
    .insertInto("research_line")
    .values({
      name: data.translations.es.name,
      nameEN: data.translations.en.name,
      description: data.translations.es.description ?? null,
      descriptionEN: data.translations.en.description ?? null,
      groupId: data.groupId,
    })
    .executeTakeFirst();
  return Number(result.insertId);
}

export async function updateResearchLine(
  id: number,
  data: { translations: Bilingual<{ name: string; description?: string }> },
) {
  await db
    .updateTable("research_line")
    .set({
      name: data.translations.es.name,
      nameEN: data.translations.en.name,
      description: data.translations.es.description ?? null,
      descriptionEN: data.translations.en.description ?? null,
    })
    .where("id", "=", id)
    .execute();
}

export async function deleteResearchLine(id: number) {
  await db.deleteFrom("research_line").where("id", "=", id).execute();
}

// Methods
export async function listMethods(groupId?: number) {
  let query = db.selectFrom("method").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function getMethod(id: number) {
  return db.selectFrom("method").selectAll().where("id", "=", id).executeTakeFirst();
}

export function toAdminMethodView(row: MethodRow) {
  return {
    id: row.id,
    photo: row.photo,
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: {
      es: { name: row.name, description: row.description },
      en: { name: row.nameEN, description: row.descriptionEN ?? "" },
    },
  };
}

export async function createMethod(data: {
  groupId: number;
  translations: Bilingual<{ name: string; description: string }>;
}) {
  const result = await db
    .insertInto("method")
    .values({
      name: data.translations.es.name,
      nameEN: data.translations.en.name,
      description: data.translations.es.description,
      descriptionEN: data.translations.en.description,
      groupId: data.groupId,
    })
    .executeTakeFirst();
  return Number(result.insertId);
}

export async function updateMethod(
  id: number,
  data: { translations: Bilingual<{ name: string; description: string }> },
) {
  await db
    .updateTable("method")
    .set({
      name: data.translations.es.name,
      nameEN: data.translations.en.name,
      description: data.translations.es.description,
      descriptionEN: data.translations.en.description,
    })
    .where("id", "=", id)
    .execute();
}

export async function deleteMethod(id: number) {
  await db.deleteFrom("method").where("id", "=", id).execute();
}

// Software
export async function listSoftware(groupId?: number) {
  let query = db.selectFrom("software").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function createSoftware(data: {
  name?: string;
  description?: string;
  descriptionEN?: string;
  moreInfo?: string;
  groupId: number;
}) {
  const result = await db.insertInto("software").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateSoftware(
  id: number,
  data: { name?: string; description?: string; descriptionEN?: string; moreInfo?: string },
) {
  await db.updateTable("software").set(data).where("id", "=", id).execute();
}

export async function deleteSoftware(id: number) {
  await db.deleteFrom("software").where("id", "=", id).execute();
}

// Equipment
export async function listEquipment(groupId?: number) {
  let query = db.selectFrom("equipment").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function createEquipment(data: {
  name: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  groupId: number;
}) {
  const result = await db.insertInto("equipment").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateEquipment(
  id: number,
  data: { name: string; cpu?: string; gpu?: string; ram?: string; storage?: string },
) {
  await db.updateTable("equipment").set(data).where("id", "=", id).execute();
}

export async function deleteEquipment(id: number) {
  await db.deleteFrom("equipment").where("id", "=", id).execute();
}
