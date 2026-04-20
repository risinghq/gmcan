import { sql } from "kysely";

import { db } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";

export async function listProjects(status?: number) {
  let query = db.selectFrom("project").selectAll();
  if (status !== undefined) query = query.where("status", "=", status);
  return query.execute();
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

export async function createProject(data: {
  title: string;
  titleEN?: string;
  code: string;
  fundedAmount: string;
  description: string;
  descriptionEN?: string;
  status?: number;
  startDate: string;
  endDate?: string;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
}) {
  const result = await db.insertInto("project").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateProject(
  id: number,
  data: {
    title: string;
    titleEN?: string;
    code: string;
    fundedAmount: string;
    description: string;
    descriptionEN?: string;
    status?: number;
    startDate: string;
    endDate?: string;
    researchLineId: number;
    currencyId: number;
    fundingSourceId: number;
  },
) {
  await db.updateTable("project").set(data).where("id", "=", id).execute();
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
