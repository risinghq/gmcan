import type { RawBuilder } from "kysely";

import { atomic, db, insertedId, lastInsertId, queryInChunks } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";
import type { ProjectStatusCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminProjectListItem, AdminProjectMemberListItem } from "./admin-list.types.js";
import { resolveMemberPhotoViews } from "./member-photo.service.js";

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

async function listProjectsLocalizedRows(locale: Locale, statusCode?: ProjectStatusCode, memberId?: number) {
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
  if (memberId !== undefined) {
    query = query
      .innerJoin("project_member", "project_member.projectId", "project.id")
      .where("project_member.memberId", "=", memberId);
  }
  return query.execute();
}

async function listAdminProjectRows(locale: Locale, statusCode?: ProjectStatusCode, q?: string) {
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

export async function createProject(data: ProjectAdminInput) {
  const now = new Date().toISOString();
  const results = await atomic([
    db.insertInto("project").values({ ...toProjectRow(data), createdAt: now, updatedAt: now }),
    insertProjectTranslations(lastInsertId("project"), data.translations),
  ]);
  return insertedId(results, 0);
}

export async function updateProject(id: number, data: ProjectAdminInput) {
  await db
    .updateTable("project")
    .set({ ...toProjectRow(data), updatedAt: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
  await replaceProjectTranslations(id, data.translations);
}

export async function deleteProject(id: number) {
  await db.deleteFrom("project").where("id", "=", id).execute();
}

export async function endProject(id: number) {
  const now = new Date().toISOString();
  await db
    .updateTable("project")
    .set({ endDate: now.slice(0, 10), statusCode: "completed", updatedAt: now })
    .where("id", "=", id)
    .execute();
}

export async function restartProject(id: number) {
  await db
    .updateTable("project")
    .set({ endDate: null, statusCode: "active", updatedAt: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

interface ProjectMemberRow {
  projectId: number;
  memberId: number;
  firstName: string;
  lastName: string;
  maternalName: string | null;
}

async function listProjectMemberRowsByProjectIds(projectIds: number[], orderByProject = false) {
  return queryInChunks(projectIds, (chunk) => {
    let query = db
      .selectFrom("project_member")
      .innerJoin("member", "member.id", "project_member.memberId")
      .select([
        "project_member.projectId as projectId",
        "member.id as memberId",
        "member.firstName as firstName",
        "member.lastName as lastName",
        "member.maternalName as maternalName",
      ])
      .where("project_member.projectId", "in", chunk);

    if (orderByProject) query = query.orderBy("project_member.projectId", "asc");
    return query.execute() as Promise<ProjectMemberRow[]>;
  });
}

export async function listProjectMembers(projectId: number) {
  return db
    .selectFrom("member")
    .innerJoin("project_member", "project_member.memberId", "member.id")
    .select([...MEMBER_NAME, "member.email as email"])
    .where("project_member.projectId", "=", projectId)
    .execute();
}

export async function addMemberToProject(projectId: number, memberId: number) {
  const now = new Date().toISOString();
  await db.insertInto("project_member").values({ projectId, memberId, createdAt: now, updatedAt: now }).execute();
}

export async function removeMemberFromProject(projectId: number, memberId: number) {
  await db.deleteFrom("project_member").where("projectId", "=", projectId).where("memberId", "=", memberId).execute();
}

function memberDisplayName(row: { firstName: string; lastName: string; maternalName: string | null }): string {
  return [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" ");
}

export async function listProjectsLocalized(locale: Locale, statusCode?: ProjectStatusCode, memberId?: number) {
  const projects = await listProjectsLocalizedRows(locale, statusCode, memberId);
  if (projects.length === 0) return [];

  const projectIds = projects.map((p) => p.id);
  const memberRows = await listProjectMemberRowsByProjectIds(projectIds);
  const photoByMemberId = await resolveMemberPhotoViews(
    memberRows.map((row) => ({ memberId: row.memberId, fullName: memberDisplayName(row) })),
    locale,
  );

  const membersByProject = new Map<number, { memberId: number; name: string; photoUrl: string; photoAlt: string }[]>();
  for (const row of memberRows) {
    const current = membersByProject.get(row.projectId) ?? [];
    const photo = photoByMemberId.get(row.memberId);
    current.push({
      memberId: row.memberId,
      name: memberDisplayName(row),
      photoUrl: photo?.photoUrl ?? "",
      photoAlt: photo?.photoAlt ?? "",
    });
    membersByProject.set(row.projectId, current);
  }

  return projects.map((project) => Object.assign(project, { members: membersByProject.get(project.id) ?? [] }));
}

export async function listAdminProjects(
  locale: Locale,
  statusCode?: ProjectStatusCode,
  q?: string,
): Promise<AdminProjectListItem[]> {
  const projects = await listAdminProjectRows(locale, statusCode, q);
  if (projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const memberRows = await listProjectMemberRowsByProjectIds(projectIds, true);
  const photoByMemberId = await resolveMemberPhotoViews(
    memberRows.map((row) => ({ memberId: row.memberId, fullName: memberDisplayName(row) })),
    locale,
  );

  const membersByProject = new Map<number, AdminProjectMemberListItem[]>();
  for (const row of memberRows) {
    const current = membersByProject.get(row.projectId) ?? [];
    const photo = photoByMemberId.get(row.memberId);
    current.push({
      memberId: row.memberId,
      name: memberDisplayName(row),
      photoUrl: photo?.photoUrl ?? "",
      photoAlt: photo?.photoAlt ?? "",
    });
    membersByProject.set(row.projectId, current);
  }

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    code: project.code,
    fundedAmountMinor: project.fundedAmountMinor,
    description: project.description,
    statusCode: project.statusCode,
    startDate: project.startDate,
    endDate: project.endDate,
    researchLineId: project.researchLineId,
    currencyCode: project.currencyCode,
    fundingSourceCode: project.fundingSourceCode,
    startDateLabel: monthYearEs(project.startDate),
    members: membersByProject.get(project.id) ?? [],
  }));
}
