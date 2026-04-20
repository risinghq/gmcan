import { db } from "../db/client.js";

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

export async function getGroupFile(id: number, column: "facilitiesPhoto" | "logoHeader" | "logoFooter") {
  return db.selectFrom("research_group").select(column).where("id", "=", id).executeTakeFirst();
}

export async function setGroupFile(id: number, column: "facilitiesPhoto" | "logoHeader" | "logoFooter", value: string) {
  await db
    .updateTable("research_group")
    .set({ [column]: value })
    .where("id", "=", id)
    .execute();
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

export async function getAboutPhoto(id: number) {
  return db.selectFrom("about").select("photo").where("id", "=", id).executeTakeFirst();
}

export async function setAboutPhoto(id: number, photo: string) {
  await db.updateTable("about").set({ photo }).where("id", "=", id).execute();
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

export async function createResearchLine(data: {
  name: string;
  nameEN: string;
  description?: string;
  descriptionEN?: string;
  groupId: number;
}) {
  const result = await db.insertInto("research_line").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateResearchLine(
  id: number,
  data: { name: string; nameEN: string; description?: string; descriptionEN?: string },
) {
  await db.updateTable("research_line").set(data).where("id", "=", id).execute();
}

export async function deleteResearchLine(id: number) {
  await db.deleteFrom("research_line").where("id", "=", id).execute();
}

export async function getResearchLinePhoto(id: number) {
  return db.selectFrom("research_line").select("photo").where("id", "=", id).executeTakeFirst();
}

export async function setResearchLinePhoto(id: number, photo: string) {
  await db.updateTable("research_line").set({ photo }).where("id", "=", id).execute();
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

export async function createMethod(data: {
  name: string;
  nameEN: string;
  description: string;
  descriptionEN?: string;
  groupId: number;
}) {
  const result = await db.insertInto("method").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateMethod(
  id: number,
  data: { name: string; nameEN: string; description: string; descriptionEN?: string },
) {
  await db.updateTable("method").set(data).where("id", "=", id).execute();
}

export async function deleteMethod(id: number) {
  await db.deleteFrom("method").where("id", "=", id).execute();
}

export async function getMethodPhoto(id: number) {
  return db.selectFrom("method").select("photo").where("id", "=", id).executeTakeFirst();
}

export async function setMethodPhoto(id: number, photo: string) {
  await db.updateTable("method").set({ photo }).where("id", "=", id).execute();
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
