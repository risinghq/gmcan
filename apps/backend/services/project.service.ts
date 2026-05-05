import { sql } from "kysely";

import { db } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";
import type { ProjectRow } from "../db/schema.js";
import type { Bilingual } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
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
  translations: Bilingual<{ title: string; description: string }>;
}

function toProjectRow(data: ProjectAdminInput) {
  const es = data.translations["es"];
  const en = data.translations["en"];
  return {
    title: es.title,
    titleEN: en?.title,
    code: data.code,
    fundedAmount: data.fundedAmount,
    description: es.description,
    descriptionEN: en?.description,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    researchLineId: data.researchLineId,
    currencyId: data.currencyId,
    fundingSourceId: data.fundingSourceId,
  };
}

export async function listProjects(status?: number) {
  let query = db.selectFrom("project").selectAll();
  if (status !== undefined) query = query.where("status", "=", status);
  return query.execute();
}

export async function listAdminProjects(status?: number, q?: string): Promise<AdminProjectListItem[]> {
  let query = db.selectFrom("project").selectAll();
  if (status !== undefined) query = query.where("project.status", "=", status);
  if (q) {
    const like = `%${q}%`;
    query = query.where((eb) =>
      eb.or([eb("project.title", "like", like), eb("project.titleEN", "like", like), eb("project.code", "like", like)]),
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
      "member.photo as photo",
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

export function toAdminProjectView(project: ProjectRow) {
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
    translations: {
      es: { title: project.title, description: project.description },
      en: { title: project.titleEN ?? "", description: project.descriptionEN ?? "" },
    },
  };
}

export async function getProject(id: number) {
  return db.selectFrom("project").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function searchProjects(q: string, status?: number) {
  const like = `%${q}%`;
  let query = db
    .selectFrom("project")
    .selectAll()
    .where((eb) => eb.or([eb("title", "like", like), eb("titleEN", "like", like), eb("code", "like", like)]));
  if (status !== undefined) query = query.where("status", "=", status);
  return query.execute();
}

export async function createProject(data: ProjectAdminInput) {
  const result = await db.insertInto("project").values(toProjectRow(data)).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateProject(id: number, data: ProjectAdminInput) {
  await db.updateTable("project").set(toProjectRow(data)).where("id", "=", id).execute();
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
