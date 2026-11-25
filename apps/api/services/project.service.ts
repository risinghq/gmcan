import type { AdminProject, ProjectWrite } from "@gmcan/contracts/admin";
import type { Compilable, RawBuilder } from "kysely";

import { atomic, db, insertedId, lastInsertId, queryInChunks, readBatch } from "../db/client.js";
import type { ProjectStatusCode } from "../db/schema.js";
import { monthYearEs } from "../lib/date-label.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminProjectListItem, AdminProjectMemberListItem } from "./admin-list.types.js";
import { resolveMemberPhotoViews } from "./member-photo.service.js";

function toProjectRow(data: ProjectWrite) {
  return {
    code: data.code,
    fundedAmountMinor: data.fundedAmountMinor,
    statusCode: data.statusCode,
    startDate: data.startDate,
    endDate: data.endDate,
    researchLineId: data.researchLineId,
    currencyCode: data.currencyCode,
    fundingSourceCode: data.fundingSourceCode,
  };
}

function insertProjectTranslations(projectId: number | RawBuilder<number>, translations: ProjectWrite["translations"]) {
  return db.insertInto("project_translation").values(
    Object.entries(translations).map(([locale, tr]) => ({
      projectId,
      locale,
      title: tr.title,
      description: tr.description,
    })),
  );
}

/** Kysely refuses an empty insert, so a project without members inserts nothing. */
function insertProjectMembers(projectId: number | RawBuilder<number>, memberIds: number[], now: string): Compilable[] {
  if (memberIds.length === 0) return [];
  return [
    db
      .insertInto("project_member")
      .values(memberIds.map((memberId) => ({ projectId, memberId, createdAt: now, updatedAt: now })))
      .onConflict((oc) => oc.columns(["projectId", "memberId"]).doNothing()),
  ];
}

function removeAbsentProjectMembers(projectId: number, memberIds: number[]) {
  const query = db.deleteFrom("project_member").where("projectId", "=", projectId);
  return memberIds.length === 0 ? query : query.where("memberId", "not in", memberIds);
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

export async function getAdminProject(id: number): Promise<AdminProject | undefined> {
  const [projects, translations, members] = await readBatch([
    db.selectFrom("project").selectAll().where("id", "=", id),
    db.selectFrom("project_translation").select(["locale", "title", "description"]).where("projectId", "=", id),
    db.selectFrom("project_member").select("memberId").where("projectId", "=", id).orderBy("createdAt"),
  ]);
  const project = projects[0];
  if (!project) return undefined;

  return {
    ...project,
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { title: tr.title, description: tr.description }]),
    ),
    memberIds: members.map((row) => row.memberId),
  };
}

export async function createProject(data: ProjectWrite) {
  const now = new Date().toISOString();
  const projectId = lastInsertId("project");
  const results = await atomic([
    db.insertInto("project").values({ ...toProjectRow(data), createdAt: now, updatedAt: now }),
    insertProjectTranslations(projectId, data.translations),
    ...insertProjectMembers(projectId, data.memberIds, now),
  ]);
  return insertedId(results, 0);
}

export async function updateProject(id: number, data: ProjectWrite) {
  const now = new Date().toISOString();
  await atomic([
    db
      .updateTable("project")
      .set({ ...toProjectRow(data), updatedAt: now })
      .where("id", "=", id),
    db.deleteFrom("project_translation").where("projectId", "=", id),
    insertProjectTranslations(id, data.translations),
    removeAbsentProjectMembers(id, data.memberIds),
    ...insertProjectMembers(id, data.memberIds, now),
  ]);
}

export async function deleteProject(id: number) {
  await db.deleteFrom("project").where("id", "=", id).execute();
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
