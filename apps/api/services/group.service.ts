import {
  AboutSectionSchema,
  type AboutTranslation,
  type AboutWrite,
  type AdminAbout,
  type AdminGroup,
  type GroupWrite,
  HomeTeaserSchema,
} from "@gmcan/contracts/admin";
import type { PublicGroupTopic } from "@gmcan/contracts/public";
import type { z } from "zod";

import { atomic, db, insertedId, lastInsertId, queryInChunks } from "../db/client.js";
import type { MethodRow, ResearchLineRow } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { AppError } from "../lib/errors/app-error.js";
import { type Locale } from "../lib/public-locale.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "./assets/service.js";

/** Stored JSON that is absent or malformed is a data fault, not a client error. */
function parseStoredJson<T>(raw: string, schema: z.ZodType<T>, field: string): T {
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throw new AppError("internal_error", "Malformed stored content", 500, { field });
  }
}

const emptyToNull = (value: string) => (value.trim() === "" ? null : value);

export async function resolveGroupAssets(groupId: number): Promise<AdminGroup["assets"]> {
  const [facilities, header, footer] = await Promise.all(
    (["facilities", "header", "footer"] as const).map((slot) =>
      resolveAssetAccessUrl({ ownerType: "research_group", ownerId: groupId, slot }),
    ),
  );
  return { facilities, header, footer };
}

export async function listAdminGroups(): Promise<AdminGroup[]> {
  const rows = await db.selectFrom("research_group").selectAll().execute();
  const translations = await queryInChunks(
    rows.map((row) => row.id),
    (chunk) => db.selectFrom("research_group_translation").selectAll().where("groupId", "in", chunk).execute(),
  );
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      shortName: row.shortName,
      fullName: row.fullName,
      email: row.email ?? "",
      phone: row.phone ?? "",
      assets: await resolveGroupAssets(row.id),
      translations: Object.fromEntries(
        translations
          .filter((tr) => tr.groupId === row.id)
          .map((tr) => [
            tr.locale,
            {
              summary: tr.summary,
              facilities: tr.facilities ?? "",
              futureWork: tr.futureWork ?? "",
              publicationsSection: tr.publicationsSection ?? "",
              projectsSection: tr.projectsSection ?? "",
            },
          ]),
      ),
    })),
  );
}

/** Replaces the group's fields and every translation together. Returns false when the group does not exist. */
export async function updateGroup(id: number, data: GroupWrite): Promise<boolean> {
  const exists = await db.selectFrom("research_group").select("id").where("id", "=", id).executeTakeFirst();
  if (!exists) return false;
  await atomic([
    db
      .updateTable("research_group")
      .set({ email: emptyToNull(data.email), phone: emptyToNull(data.phone), updatedAt: new Date().toISOString() })
      .where("id", "=", id),
    db.deleteFrom("research_group_translation").where("groupId", "=", id),
    db.insertInto("research_group_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        groupId: id,
        locale,
        summary: tr.summary,
        facilities: emptyToNull(tr.facilities),
        futureWork: emptyToNull(tr.futureWork),
        publicationsSection: emptyToNull(tr.publicationsSection),
        projectsSection: emptyToNull(tr.projectsSection),
      })),
    ),
  ]);
  return true;
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

interface StoredAboutTranslation {
  description: string;
  objectivesContent: string;
  servicesContent: string;
  homeServicesTeaserContent: string;
}

function parseAboutTranslation(tr: StoredAboutTranslation, label: string): AboutTranslation {
  return {
    description: tr.description,
    objectivesContent: parseStoredJson(tr.objectivesContent, AboutSectionSchema, `${label}:objectivesContent`),
    servicesContent: parseStoredJson(tr.servicesContent, AboutSectionSchema, `${label}:servicesContent`),
    homeServicesTeaserContent: parseStoredJson(
      tr.homeServicesTeaserContent,
      HomeTeaserSchema,
      `${label}:homeServicesTeaserContent`,
    ),
  };
}

export async function listAboutLocalized(groupId: number, locale: Locale) {
  const rows = await db
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
  return rows.map((row) =>
    Object.assign(
      { id: row.id, groupId: row.groupId, createdAt: row.createdAt, updatedAt: row.updatedAt },
      parseAboutTranslation(row, `about:${row.id}:${locale}`),
    ),
  );
}

export async function listAdminAbout(groupId: number): Promise<AdminAbout[]> {
  const rows = await db.selectFrom("about").selectAll().where("groupId", "=", groupId).execute();
  const ids = rows.map((row) => row.id);
  const translations = await queryInChunks(ids, (chunk) =>
    db.selectFrom("about_translation").selectAll().where("aboutId", "in", chunk).execute(),
  );
  const assets = await resolveAssetAccessUrls({ ownerType: "about", ownerIds: ids, slot: "photo" });
  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    asset: assets.get(row.id) ?? null,
    translations: Object.fromEntries(
      translations
        .filter((tr) => tr.aboutId === row.id)
        .map((tr) => [tr.locale, parseAboutTranslation(tr, `about:${row.id}:${tr.locale}`)]),
    ),
  }));
}

/** Replaces every translation of the about page together. Returns false when it does not exist. */
export async function updateAbout(id: number, data: AboutWrite): Promise<boolean> {
  const exists = await db.selectFrom("about").select("id").where("id", "=", id).executeTakeFirst();
  if (!exists) return false;
  await atomic([
    db.updateTable("about").set({ updatedAt: new Date().toISOString() }).where("id", "=", id),
    db.deleteFrom("about_translation").where("aboutId", "=", id),
    db.insertInto("about_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        aboutId: id,
        locale,
        description: tr.description,
        objectivesContent: JSON.stringify(tr.objectivesContent),
        servicesContent: JSON.stringify(tr.servicesContent),
        homeServicesTeaserContent: JSON.stringify(tr.homeServicesTeaserContent),
      })),
    ),
  ]);
  return true;
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

type TopicRow = Omit<PublicGroupTopic, "asset">;

async function withPhotos(ownerType: "research_line" | "method", rows: TopicRow[]): Promise<PublicGroupTopic[]> {
  const assets = await resolveAssetAccessUrls({ ownerType, ownerIds: rows.map((row) => row.id), slot: "photo" });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    asset: assets.get(row.id) ?? null,
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function listPublicResearchLines(locale: Locale) {
  return withPhotos("research_line", await listResearchLinesLocalized(locale));
}

export async function listPublicMethods(locale: Locale) {
  return withPhotos("method", await listMethodsLocalized(locale));
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
  const now = new Date().toISOString();
  const results = await atomic([
    db.insertInto("research_line").values({ groupId: data.groupId, createdAt: now, updatedAt: now }),
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
  await atomic([
    db.deleteFrom("research_line_translation").where("researchLineId", "=", id),
    db.insertInto("research_line_translation").values(
      Object.entries(data.translations).map(([locale, row]) => ({
        researchLineId: id,
        locale,
        name: row.name,
        description: row.description ?? null,
      })),
    ),
  ]);
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
  const now = new Date().toISOString();
  const results = await atomic([
    db.insertInto("method").values({ groupId: data.groupId, createdAt: now, updatedAt: now }),
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
  await atomic([
    db.deleteFrom("method_translation").where("methodId", "=", id),
    db.insertInto("method_translation").values(
      Object.entries(data.translations).map(([locale, row]) => ({
        methodId: id,
        locale,
        name: row.name,
        description: row.description,
      })),
    ),
  ]);
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
  translations: LocalizedTranslations<{ name: string; description?: string }>;
  moreInfo?: string;
  groupId: number;
}) {
  const now = new Date().toISOString();
  const results = await atomic([
    db
      .insertInto("software")
      .values({ moreInfo: data.moreInfo, groupId: data.groupId, createdAt: now, updatedAt: now }),
    db.insertInto("software_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        softwareId: lastInsertId("software"),
        locale,
        name: tr.name,
        description: tr.description ?? null,
      })),
    ),
  ]);
  return insertedId(results, 0);
}

export async function updateSoftware(
  id: number,
  data: { translations: LocalizedTranslations<{ name: string; description?: string }>; moreInfo?: string },
) {
  await atomic([
    db
      .updateTable("software")
      .set({ moreInfo: data.moreInfo, updatedAt: new Date().toISOString() })
      .where("id", "=", id),
    db.deleteFrom("software_translation").where("softwareId", "=", id),
    db.insertInto("software_translation").values(
      Object.entries(data.translations).map(([locale, tr]) => ({
        softwareId: id,
        locale,
        name: tr.name,
        description: tr.description ?? null,
      })),
    ),
  ]);
}

export async function deleteSoftware(id: number) {
  await db.deleteFrom("software").where("id", "=", id).execute();
}

export async function getSoftware(id: number) {
  return db.selectFrom("software").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function toAdminSoftwareViews(rows: Awaited<ReturnType<typeof listSoftware>>) {
  const translations = await queryInChunks(
    rows.map((row) => row.id),
    (chunk) =>
      db
        .selectFrom("software_translation")
        .select(["softwareId", "locale", "name", "description"])
        .where("softwareId", "in", chunk)
        .execute(),
  );
  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    moreInfo: row.moreInfo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: Object.fromEntries(
      translations
        .filter((tr) => tr.softwareId === row.id)
        .map((tr) => [tr.locale, { name: tr.name, description: tr.description ?? "" }]),
    ),
  }));
}

export async function getEquipment(id: number) {
  return db.selectFrom("equipment").selectAll().where("id", "=", id).executeTakeFirst();
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
  const now = new Date().toISOString();
  const result = await db
    .insertInto("equipment")
    .values({ ...data, createdAt: now, updatedAt: now })
    .executeTakeFirst();
  return Number(result.insertId);
}

export async function updateEquipment(
  id: number,
  data: { name: string; cpu?: string; gpu?: string; ram?: string; storage?: string },
) {
  await db
    .updateTable("equipment")
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

export async function deleteEquipment(id: number) {
  await db.deleteFrom("equipment").where("id", "=", id).execute();
}
