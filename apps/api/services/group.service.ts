import type { Compilable } from "kysely";

import { atomic, db, insertedId, lastInsertId, queryInChunks } from "../db/client.js";
import type { MethodRow, ResearchLineRow } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { type Locale } from "../lib/public-locale.js";

export type AboutSectionContent = { introParagraphs: string[]; items: string[] };

async function replaceTranslations(table: TTable, ownerId: number, values: Record<string, Record<string, unknown>>) {
  const rows = Object.entries(values).map(([locale, payload]) => ({ locale, payload }));
  const ownerColumnByTable = {
    research_group_translation: "groupId",
    about_translation: "aboutId",
    research_line_translation: "researchLineId",
    method_translation: "methodId",
    software_translation: "softwareId",
  } as const;
  const ownerColumn = ownerColumnByTable[table];

  const queries: Compilable[] = [db.deleteFrom(table).where(ownerColumn, "=", ownerId)];
  if (rows.length > 0) {
    queries.push(
      db
        .insertInto(table)
        .values(rows.map(({ locale, payload }) => Object.assign({ [ownerColumn]: ownerId, locale }, payload))),
    );
  }
  await atomic(queries);
}

type TTable =
  | "research_group_translation"
  | "about_translation"
  | "research_line_translation"
  | "method_translation"
  | "software_translation";

export async function listGroups() {
  return db.selectFrom("research_group").selectAll().execute();
}

export async function listGroupsLocalized(locale: Locale) {
  return db
    .selectFrom("research_group")
    .innerJoin("research_group_translation", "research_group_translation.groupId", "research_group.id")
    .select([
      "research_group.id as id",
      "research_group.address as address",
      "research_group.email as email",
      "research_group.phone as phone",
      "research_group.shortName as name",
      "research_group.fullName as fullName",
      "research_group.createdAt as createdAt",
      "research_group.updatedAt as updatedAt",
      "research_group_translation.summary as summary",
      "research_group_translation.facilities as facilities",
      "research_group_translation.futureWork as futureWork",
      "research_group_translation.publicationsSection as publicationsSection",
      "research_group_translation.projectsSection as projectsSection",
    ])
    .where("research_group_translation.locale", "=", locale)
    .execute();
}

export async function updateGroupInfo(id: number, data: { email?: string; phone?: string }) {
  await db.updateTable("research_group").set(data).where("id", "=", id).execute();
}

export async function updateGroupSummary(
  id: number,
  data: { translations: LocalizedTranslations<{ summary: string }> },
) {
  await replaceTranslations(
    "research_group_translation",
    id,
    Object.fromEntries(Object.entries(data.translations).map(([locale, row]) => [locale, { summary: row.summary }])),
  );
}

export async function updateGroupFacilities(
  id: number,
  data: { translations: LocalizedTranslations<{ facilities?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [locale, { facilities: row.facilities ?? null }]),
  );
  await replaceTranslations("research_group_translation", id, rows);
}

export async function updateGroupFutureWork(
  id: number,
  data: { translations: LocalizedTranslations<{ futureWork?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [locale, { futureWork: row.futureWork ?? null }]),
  );
  await replaceTranslations("research_group_translation", id, rows);
}

export async function updateGroupPublicationsSection(
  id: number,
  data: { translations: LocalizedTranslations<{ publicationsSection?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [
      locale,
      { publicationsSection: row.publicationsSection ?? null },
    ]),
  );
  await replaceTranslations("research_group_translation", id, rows);
}

export async function updateGroupProjectsSection(
  id: number,
  data: { translations: LocalizedTranslations<{ projectsSection?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [
      locale,
      { projectsSection: row.projectsSection ?? null },
    ]),
  );
  await replaceTranslations("research_group_translation", id, rows);
}

export async function listAbout(groupId: number) {
  const rows = await db.selectFrom("about").selectAll().where("groupId", "=", groupId).execute();
  const translations = await queryInChunks(
    rows.map((row) => row.id),
    (chunk) => db.selectFrom("about_translation").selectAll().where("aboutId", "in", chunk).execute(),
  );
  return rows.map((row) =>
    Object.assign({}, row, { translations: translations.filter((tr) => tr.aboutId === row.id) }),
  );
}

export async function listAboutLocalized(groupId: number, locale: Locale) {
  return db
    .selectFrom("about")
    .innerJoin("about_translation", "about_translation.aboutId", "about.id")
    .select([
      "about.id as id",
      "about.createdAt as createdAt",
      "about.updatedAt as updatedAt",
      "about.groupId as groupId",
      "about_translation.description as description",
      "about_translation.objectivesContent as objectivesContent",
      "about_translation.servicesContent as servicesContent",
      "about_translation.homeServicesTeaserContent as homeServicesTeaserContent",
    ])
    .where("about.groupId", "=", groupId)
    .where("about_translation.locale", "=", locale)
    .execute();
}

export async function updateAboutDescription(
  id: number,
  data: { translations: LocalizedTranslations<{ description: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [locale, { description: row.description }]),
  );
  await replaceTranslations("about_translation", id, rows);
}

export async function updateAboutObjectives(
  id: number,
  data: { translations: LocalizedTranslations<{ objectivesContent?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [
      locale,
      { objectivesContent: row.objectivesContent ?? null },
    ]),
  );
  await replaceTranslations("about_translation", id, rows);
}

export async function updateAboutServices(
  id: number,
  data: { translations: LocalizedTranslations<{ servicesContent?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [
      locale,
      { servicesContent: row.servicesContent ?? null },
    ]),
  );
  await replaceTranslations("about_translation", id, rows);
}

export async function updateAboutHomeServicesTeaser(
  id: number,
  data: { translations: LocalizedTranslations<{ homeServicesTeaserContent?: string }> },
) {
  const rows = Object.fromEntries(
    Object.entries(data.translations).map(([locale, row]) => [
      locale,
      { homeServicesTeaserContent: row.homeServicesTeaserContent ?? null },
    ]),
  );
  await replaceTranslations("about_translation", id, rows);
}

export async function listResearchLines(groupId?: number) {
  let query = db.selectFrom("research_line").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function listResearchLinesLocalized(locale: Locale, groupId?: number) {
  let query = db
    .selectFrom("research_line")
    .innerJoin("research_line_translation", "research_line_translation.researchLineId", "research_line.id")
    .select([
      "research_line.id as id",
      "research_line.groupId as groupId",
      "research_line.createdAt as createdAt",
      "research_line.updatedAt as updatedAt",
      "research_line_translation.name as name",
      "research_line_translation.description as description",
    ])
    .where("research_line_translation.locale", "=", locale);
  if (groupId !== undefined) query = query.where("research_line.groupId", "=", groupId);
  return query.execute();
}

export async function getResearchLine(id: number) {
  return db.selectFrom("research_line").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function getResearchLineLocalized(id: number, locale: Locale) {
  return db
    .selectFrom("research_line")
    .innerJoin("research_line_translation", "research_line_translation.researchLineId", "research_line.id")
    .select([
      "research_line.id as id",
      "research_line.groupId as groupId",
      "research_line.createdAt as createdAt",
      "research_line.updatedAt as updatedAt",
      "research_line_translation.name as name",
      "research_line_translation.description as description",
    ])
    .where("research_line.id", "=", id)
    .where("research_line_translation.locale", "=", locale)
    .executeTakeFirst();
}

export async function toAdminResearchLineViews(rows: ResearchLineRow[]) {
  const translations = await queryInChunks(
    rows.map((row) => row.id),
    (chunk) =>
      db
        .selectFrom("research_line_translation")
        .select(["researchLineId", "locale", "name", "description"])
        .where("researchLineId", "in", chunk)
        .execute(),
  );
  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: Object.fromEntries(
      translations
        .filter((tr) => tr.researchLineId === row.id)
        .map((tr) => [tr.locale, { name: tr.name, description: tr.description ?? "" }]),
    ),
  }));
}

export async function createResearchLine(data: {
  groupId: number;
  translations: LocalizedTranslations<{ name: string; description?: string }>;
}) {
  const results = await atomic([
    db.insertInto("research_line").values({ groupId: data.groupId }),
    db.insertInto("research_line_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        researchLineId: lastInsertId("research_line"),
        locale,
        name: tr.name,
        description: tr.description ?? null,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateResearchLine(
  id: number,
  data: { translations: LocalizedTranslations<{ name: string; description?: string }> },
) {
  await replaceTranslations(
    "research_line_translation",
    id,
    Object.fromEntries(
      Object.entries(data.translations).map(([locale, row]) => [
        locale,
        { name: row.name, description: row.description ?? null },
      ]),
    ),
  );
}

export async function deleteResearchLine(id: number) {
  await db.deleteFrom("research_line").where("id", "=", id).execute();
}

export async function listMethods(groupId?: number) {
  let query = db.selectFrom("method").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function listMethodsLocalized(locale: Locale, groupId?: number) {
  let query = db
    .selectFrom("method")
    .innerJoin("method_translation", "method_translation.methodId", "method.id")
    .select([
      "method.id as id",
      "method.groupId as groupId",
      "method.createdAt as createdAt",
      "method.updatedAt as updatedAt",
      "method_translation.name as name",
      "method_translation.description as description",
    ])
    .where("method_translation.locale", "=", locale);
  if (groupId !== undefined) query = query.where("method.groupId", "=", groupId);
  return query.execute();
}

export async function getMethod(id: number) {
  return db.selectFrom("method").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function getMethodLocalized(id: number, locale: Locale) {
  return db
    .selectFrom("method")
    .innerJoin("method_translation", "method_translation.methodId", "method.id")
    .select([
      "method.id as id",
      "method.groupId as groupId",
      "method.createdAt as createdAt",
      "method.updatedAt as updatedAt",
      "method_translation.name as name",
      "method_translation.description as description",
    ])
    .where("method.id", "=", id)
    .where("method_translation.locale", "=", locale)
    .executeTakeFirst();
}

export async function toAdminMethodViews(rows: MethodRow[]) {
  const translations = await queryInChunks(
    rows.map((row) => row.id),
    (chunk) =>
      db
        .selectFrom("method_translation")
        .select(["methodId", "locale", "name", "description"])
        .where("methodId", "in", chunk)
        .execute(),
  );
  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: Object.fromEntries(
      translations
        .filter((tr) => tr.methodId === row.id)
        .map((tr) => [tr.locale, { name: tr.name, description: tr.description ?? "" }]),
    ),
  }));
}

export async function createMethod(data: {
  groupId: number;
  translations: LocalizedTranslations<{ name: string; description: string }>;
}) {
  const results = await atomic([
    db.insertInto("method").values({ groupId: data.groupId }),
    db.insertInto("method_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        methodId: lastInsertId("method"),
        locale,
        name: tr.name,
        description: tr.description,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateMethod(
  id: number,
  data: { translations: LocalizedTranslations<{ name: string; description: string }> },
) {
  await replaceTranslations(
    "method_translation",
    id,
    Object.fromEntries(
      Object.entries(data.translations).map(([locale, row]) => [
        locale,
        { name: row.name, description: row.description },
      ]),
    ),
  );
}

export async function deleteMethod(id: number) {
  await db.deleteFrom("method").where("id", "=", id).execute();
}

export async function listSoftware(groupId?: number) {
  let query = db.selectFrom("software").selectAll();
  if (groupId !== undefined) query = query.where("groupId", "=", groupId);
  return query.execute();
}

export async function listSoftwareLocalized(locale: Locale, groupId?: number) {
  let query = db
    .selectFrom("software")
    .innerJoin("software_translation", "software_translation.softwareId", "software.id")
    .select([
      "software.id as id",
      "software.moreInfo as moreInfo",
      "software.groupId as groupId",
      "software.createdAt as createdAt",
      "software.updatedAt as updatedAt",
      "software_translation.name as name",
      "software_translation.description as description",
    ])
    .where("software_translation.locale", "=", locale);
  if (groupId !== undefined) query = query.where("software.groupId", "=", groupId);
  return query.execute();
}

export async function createSoftware(data: {
  translations: LocalizedTranslations<{ name?: string; description?: string }>;
  moreInfo?: string;
  groupId: number;
}) {
  const results = await atomic([
    db.insertInto("software").values({ moreInfo: data.moreInfo, groupId: data.groupId }),
    db.insertInto("software_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        softwareId: lastInsertId("software"),
        locale,
        name: tr.name ?? null,
        description: tr.description ?? null,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateSoftware(
  id: number,
  data: { translations: LocalizedTranslations<{ name?: string; description?: string }>; moreInfo?: string },
) {
  await atomic([
    db.updateTable("software").set({ moreInfo: data.moreInfo }).where("id", "=", id),
    db.deleteFrom("software_translation").where("softwareId", "=", id),
    db.insertInto("software_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        softwareId: id,
        locale,
        name: tr.name ?? null,
        description: tr.description ?? null,
      })),
    ),
  ]);
}

export async function deleteSoftware(id: number) {
  await db.deleteFrom("software").where("id", "=", id).execute();
}

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
