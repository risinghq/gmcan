import { sql } from "kysely";

import { db } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";
import type { ProjectRow } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminProjectListItem, AdminProjectMemberListItem } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./asset.service.js";

export interface ProjectAdminInput {
  code: string;
  fundedAmount: string;
  status?: number;
  startDate: string;
  endDate?: string;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
  translations: LocalizedTranslations<{ title: string; description: string }>;
}

function toProjectRow(data: ProjectAdminInput) {
  return {
    code: data.code,
    fundedAmount: data.fundedAmount,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    researchLineId: data.researchLineId,
    currencyId: data.currencyId,
    fundingSourceId: data.fundingSourceId,
  };
}

async function replaceProjectTranslations(
  projectId: number,
  translations: Record<string, { title: string; description: string }>,
) {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("project_translation").where("projectId", "=", projectId).execute();
    await trx
      .insertInto("project_translation")
      .values(
        Object.entries(translations).map(([locale, tr]) => ({
          projectId,
          locale,
          title: tr.title,
          description: tr.description,
        })),
      )
      .execute();
  });
}

export async function listProjects(status?: number) {
  let query = db.selectFrom("project").selectAll();
  if (status !== undefined) query = query.where("status", "=", status);
  return query.execute();
}

export async function listProjectsLocalized(locale: Locale, status?: number) {
  let query = db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .select([
      "project.id as id",
      "project_translation.title as title",
      "project.code as code",
      "project.fundedAmount as fundedAmount",
      "project_translation.description as description",
      "project.status as status",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyId as currencyId",
      "project.fundingSourceId as fundingSourceId",
      "project.createdAt as createdAt",
      "project.updatedAt as updatedAt",
    ]);
  if (status !== undefined) query = query.where("project.status", "=", status);
  return query.execute();
}

export async function listAdminProjects(status?: number, q?: string): Promise<AdminProjectListItem[]> {
  let query = db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join
        .onRef("project_translation.projectId", "=", "project.id")
        .on("project_translation.locale", "=", DEFAULT_LOCALE),
    )
    .select([
      "project.id as id",
      "project_translation.title as title",
      "project.code as code",
      "project.fundedAmount as fundedAmount",
      "project_translation.description as description",
      "project.status as status",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyId as currencyId",
      "project.fundingSourceId as fundingSourceId",
    ]);
  if (status !== undefined) query = query.where("project.status", "=", status);
  if (q) {
    const like = `%${q}%`;
    query = query.where((eb) =>
      eb.or([eb("project_translation.title", "like", like), eb("project.code", "like", like)]),
    );
  }
  const projects = await query.orderBy("project.startDate", "desc").execute();
  if (projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const memberRows = await db
    .selectFrom("member_project")
    .innerJoin("member", "member.id", "member_project.memberId")
    .select([
      "member_project.projectId as projectId",
      "member.id as memberId",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
    ])
    .where("member_project.projectId", "in", projectIds)
    .orderBy("member_project.projectId", "asc")
    .execute();

  const memberEntries = await Promise.all(
    memberRows.map(async (row) => ({
      projectId: row.projectId,
      entry: {
        memberId: row.memberId,
        name: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
        asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.memberId, slot: "photo" }),
      } satisfies AdminProjectMemberListItem,
    })),
  );
  const membersByProject = new Map<number, AdminProjectMemberListItem[]>();
  for (const row of memberEntries) {
    const current = membersByProject.get(row.projectId) ?? [];
    current.push(row.entry);
    membersByProject.set(row.projectId, current);
  }

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    code: project.code,
    fundedAmount: project.fundedAmount,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    researchLineId: project.researchLineId,
    currencyId: project.currencyId,
    fundingSourceId: project.fundingSourceId,
    startDateLabel: monthYearEs(project.startDate),
    members: membersByProject.get(project.id) ?? [],
  }));
}

export async function toAdminProjectView(project: ProjectRow) {
  const translations = await db
    .selectFrom("project_translation")
    .select(["locale", "title", "description"])
    .where("projectId", "=", project.id)
    .execute();

  return {
    id: project.id,
    code: project.code,
    fundedAmount: project.fundedAmount,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    researchLineId: project.researchLineId,
    currencyId: project.currencyId,
    fundingSourceId: project.fundingSourceId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { title: tr.title, description: tr.description }]),
    ),
  };
}

export async function getProject(id: number) {
  return db.selectFrom("project").selectAll().where("id", "=", id).executeTakeFirst();
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
      "project.fundedAmount as fundedAmount",
      "project_translation.description as description",
      "project.status as status",
      "project.startDate as startDate",
      "project.endDate as endDate",
      "project.researchLineId as researchLineId",
      "project.currencyId as currencyId",
      "project.fundingSourceId as fundingSourceId",
      "project.createdAt as createdAt",
      "project.updatedAt as updatedAt",
    ])
    .where("project.id", "=", id)
    .executeTakeFirst();
}

export async function searchProjects(q: string, status?: number) {
  const like = `%${q}%`;
  let query = db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join
        .onRef("project_translation.projectId", "=", "project.id")
        .on("project_translation.locale", "=", DEFAULT_LOCALE),
    )
    .selectAll("project")
    .where((eb) => eb.or([eb("project_translation.title", "like", like), eb("project.code", "like", like)]));
  if (status !== undefined) query = query.where("project.status", "=", status);
  return query.execute();
}

export async function createProject(data: ProjectAdminInput) {
  const result = await db.insertInto("project").values(toProjectRow(data)).executeTakeFirstOrThrow();
  const id = Number(result.insertId);
  await replaceProjectTranslations(id, data.translations);
  return id;
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
  await db.updateTable("project").set({ endDate, status: 0 }).where("id", "=", id).execute();
}

export async function restartProject(id: number) {
  await db.updateTable("project").set({ endDate: null, status: 1 }).where("id", "=", id).execute();
}

export async function listProjectMembers(projectId: number) {
  return db
    .selectFrom("member")
    .innerJoin("member_project", "member_project.memberId", "member.id")
    .select([...MEMBER_NAME, sql<string>`member.email`.as("email")])
    .where("member_project.projectId", "=", projectId)
    .execute();
}

export async function listMemberProjects(memberId: number) {
  return db.selectFrom("member_project").selectAll().where("memberId", "=", memberId).execute();
}

export async function addMemberToProject(projectId: number, memberId: number) {
  const today = new Date().toISOString().split("T")[0];
  await db.insertInto("member_project").values({ projectId, memberId, createdAt: today, updatedAt: today }).execute();
}

export async function removeMemberFromProject(projectId: number, memberId: number) {
  await db.deleteFrom("member_project").where("projectId", "=", projectId).where("memberId", "=", memberId).execute();
}
