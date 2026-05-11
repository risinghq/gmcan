import { db } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";

export interface ProjectMemberRow {
  projectId: number;
  memberId: number;
  firstName: string;
  lastName: string;
  maternalName: string | null;
}

export async function listProjectMemberRowsByProjectIds(projectIds: number[], orderByProject = false) {
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
    .where("project_member.projectId", "in", projectIds);

  if (orderByProject) query = query.orderBy("project_member.projectId", "asc");
  return query.execute() as Promise<ProjectMemberRow[]>;
}

export async function listProjectMembers(projectId: number) {
  return db
    .selectFrom("member")
    .innerJoin("project_member", "project_member.memberId", "member.id")
    .select([...MEMBER_NAME, "member.email as email"])
    .where("project_member.projectId", "=", projectId)
    .execute();
}

export async function listMemberProjects(memberId: number) {
  return db.selectFrom("project_member").selectAll().where("memberId", "=", memberId).execute();
}

export async function addMemberToProject(projectId: number, memberId: number) {
  const now = new Date().toISOString();
  await db.insertInto("project_member").values({ projectId, memberId, createdAt: now, updatedAt: now }).execute();
}

export async function removeMemberFromProject(projectId: number, memberId: number) {
  await db.deleteFrom("project_member").where("projectId", "=", projectId).where("memberId", "=", memberId).execute();
}
