import type { RawBuilder } from "kysely";

import { atomic, db, insertedId, lastInsertId } from "../db/client.js";
import type { ProjectStatusCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import type { Locale } from "../lib/public-locale.js";

export interface ProjectAdminInput {
  code: string;
  fundedAmountMinor: number;
  statusCode?: ProjectStatusCode;
  startDate: string;
  endDate?: string;
  researchLineId: number;
  currencyCode: "pen" | "usd";
  fundingSourceCode: "vrip" | "none";
  translations: LocalizedTranslations<{ title: string; description: string }>;
}

function toProjectRow(data: ProjectAdminInput) {
  return {
    code: data.code,
    fundedAmountMinor: data.fundedAmountMinor,
    statusCode: data.statusCode ?? "planned",
    startDate: data.startDate,
    endDate: data.endDate,
    researchLineId: data.researchLineId,
    currencyCode: data.currencyCode,
    fundingSourceCode: data.fundingSourceCode,
  };
}

async function replaceProjectTranslations(
  projectId: number,
  translations: Record<string, { title: string; description: string }>,
) {
  await atomic([
    db.deleteFrom("project_translation").where("projectId", "=", projectId),
    insertProjectTranslations(projectId, translations),
  ]);
}

function insertProjectTranslations(
  projectId: number | RawBuilder<number>,
  translations: Record<string, { title: string; description: string }>,
) {
  return db.insertInto("project_translation").values(
    Object.entries(translations).map(([locale, tr]) => ({
      projectId,
      locale,
      title: tr.title,
      description: tr.description,
    })),
  );
}

export async function listProjectsLocalizedRows(locale: Locale, statusCode?: ProjectStatusCode) {
  let query = db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .leftJoin("research_line_translation", (join) =>
      join
        .onRef("research_line_translation.researchLineId", "=", "project.researchLineId")
        .on("research_line_translation.locale", "=", locale),
    )
    .innerJoin("funding_source", "funding_source.code", "project.fundingSourceCode")
    .innerJoin("currency", "currency.code", "project.currencyCode")
    .select([
      "project.id as id",
      "project_translation.title as title",
      "project.code as code",
      "project.fundedAmountMinor as fundedAmountMinor",
      "project_translation.description as description",
      "project.statusCode as statusCode",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyCode as currencyCode",
      "project.fundingSourceCode as fundingSourceCode",
      "project.createdAt as createdAt",
      "project.updatedAt as updatedAt",
      "research_line_translation.name as researchLine",
      "funding_source.name as fundingSource",
      "currency.symbol as currencySymbol",
    ]);
  if (statusCode !== undefined) query = query.where("project.statusCode", "=", statusCode);
  return query.execute();
}

export async function listAdminProjectRows(locale: Locale, statusCode?: ProjectStatusCode, q?: string) {
  let query = db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .select([
      "project.id as id",
      "project_translation.title as title",
      "project.code as code",
      "project.fundedAmountMinor as fundedAmountMinor",
      "project_translation.description as description",
      "project.statusCode as statusCode",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyCode as currencyCode",
      "project.fundingSourceCode as fundingSourceCode",
    ]);

  if (statusCode !== undefined) query = query.where("project.statusCode", "=", statusCode);
  if (q) {
    const like = `%${q}%`;
    query = query.where((eb) =>
      eb.or([eb("project_translation.title", "like", like), eb("project.code", "like", like)]),
    );
  }

  return query.orderBy("project.startDate", "desc").execute();
}

export async function getProjectLocalized(id: number, locale: Locale) {
  return db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .select([
      "project.id as id",
      "project_translation.title as title",
      "project.code as code",
      "project.fundedAmountMinor as fundedAmountMinor",
      "project_translation.description as description",
      "project.statusCode as statusCode",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyCode as currencyCode",
      "project.fundingSourceCode as fundingSourceCode",
      "project.createdAt as createdAt",
      "project.updatedAt as updatedAt",
    ])
    .where("project.id", "=", id)
    .executeTakeFirst();
}

export async function searchActiveProjectRows(locale: Locale, like: string) {
  return db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .leftJoin("research_line_translation", (join) =>
      join
        .onRef("research_line_translation.researchLineId", "=", "project.researchLineId")
        .on("research_line_translation.locale", "=", locale),
    )
    .innerJoin("funding_source", "funding_source.code", "project.fundingSourceCode")
    .select([
      "project.id",
      "project_translation.title as title",
      "project.code",
      "project.fundedAmountMinor",
      "project_translation.description as description",
      "project.statusCode",
      "project.startDate",
      "project.endDate",
      "project.researchLineId",
      "project.currencyCode",
      "project.fundingSourceCode",
      "research_line_translation.name as researchLine",
      "funding_source.name as fundingSource",
    ])
    .where("project.statusCode", "=", "active")
    .where((eb) =>
      eb.or([
        eb("project_translation.title", "like", like),
        eb("project.code", "like", like),
        eb("project_translation.description", "like", like),
        eb("research_line_translation.name", "like", like),
        eb("funding_source.name", "like", like),
      ]),
    )
    .execute();
}

export async function createProject(data: ProjectAdminInput) {
  const results = await atomic([
    db.insertInto("project").values(toProjectRow(data)),
    insertProjectTranslations(lastInsertId("project"), data.translations),
  ]);
  return insertedId(results, 0);
}

export async function updateProject(id: number, data: ProjectAdminInput) {
  await db.updateTable("project").set(toProjectRow(data)).where("id", "=", id).execute();
  await replaceProjectTranslations(id, data.translations);
}

export async function deleteProject(id: number) {
  await db.deleteFrom("project").where("id", "=", id).execute();
}

export async function endProject(id: number) {
  const endDate = new Date().toISOString().slice(0, 10);
  await db.updateTable("project").set({ endDate, statusCode: "completed" }).where("id", "=", id).execute();
}

export async function restartProject(id: number) {
  await db.updateTable("project").set({ endDate: null, statusCode: "active" }).where("id", "=", id).execute();
}
