import { db } from "../db/client.js";
import { MEMBER_NAME } from "../db/projections.js";
import type { ProjectRow, ProjectStatusCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminProjectListItem, AdminProjectMemberListItem } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./assets/service.js";

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

export async function listProjects(statusCode?: ProjectStatusCode) {
  let query = db.selectFrom("project").selectAll();
  if (statusCode !== undefined) query = query.where("statusCode", "=", statusCode);
  return query.execute();
}

export async function listProjectsLocalized(locale: Locale, statusCode?: ProjectStatusCode) {
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
      "project.createdAt as createdAt",
      "project.updatedAt as updatedAt",
    ]);
  if (statusCode !== undefined) query = query.where("project.statusCode", "=", statusCode);
  return query.execute();
}

export async function listAdminProjects(
  locale: Locale,
  statusCode?: ProjectStatusCode,
  q?: string,
): Promise<AdminProjectListItem[]> {
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

  const projects = await query.orderBy("project.startDate", "desc").execute();
  if (projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const memberRows = await db
    .selectFrom("project_member")
    .innerJoin("member", "member.id", "project_member.memberId")
    .select([
      "project_member.projectId as projectId",
      "member.id as memberId",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
    ])
    .where("project_member.projectId", "in", projectIds)
    .orderBy("project_member.projectId", "asc")
    .execute();

  const memberEntries = await Promise.all(
    memberRows.map(async (row) => ({
      projectId: row.projectId,
      entry: {
        memberId: row.memberId,
        name: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
        asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: row.memberId, slot: "photo" }),
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

export async function toAdminProjectView(project: ProjectRow) {
  const translations = await db
    .selectFrom("project_translation")
    .select(["locale", "title", "description"])
    .where("projectId", "=", project.id)
    .execute();

  return {
    id: project.id,
    code: project.code,
    fundedAmountMinor: project.fundedAmountMinor,
    statusCode: project.statusCode,
    startDate: project.startDate,
    endDate: project.endDate,
    researchLineId: project.researchLineId,
    currencyCode: project.currencyCode,
    fundingSourceCode: project.fundingSourceCode,
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

export async function searchProjects(q: string, statusCode?: ProjectStatusCode) {
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
  if (statusCode !== undefined) query = query.where("project.statusCode", "=", statusCode);
  return query.execute();
}

export async function createProject(data: ProjectAdminInput) {
  return db.transaction().execute(async (trx) => {
    const result = await trx.insertInto("project").values(toProjectRow(data)).executeTakeFirstOrThrow();
    const id = Number(result.insertId);
    await trx
      .insertInto("project_translation")
      .values(
        Object.entries(data.translations).map(([locale, tr]) => ({
          projectId: id,
          locale,
          title: tr.title,
          description: tr.description,
        })),
      )
      .execute();
    return id;
  });
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
