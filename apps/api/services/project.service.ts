import type { ProjectStatusCode } from "../db/schema.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import {
  addMemberToProject as addMemberToProjectRepo,
  listMemberProjects as listMemberProjectsRepo,
  listProjectMemberRowsByProjectIds,
  listProjectMembers as listProjectMembersRepo,
  removeMemberFromProject as removeMemberFromProjectRepo,
} from "../repositories/members.js";
import {
  createProject as createProjectRepo,
  deleteProject as deleteProjectRepo,
  endProject as endProjectRepo,
  getProject as getProjectRepo,
  getProjectLocalized as getProjectLocalizedRepo,
  listAdminProjectRows,
  listProjects as listProjectsRepo,
  listProjectsLocalizedRows,
  restartProject as restartProjectRepo,
  searchProjects as searchProjectsRepo,
  toAdminProjectView,
  type ProjectAdminInput,
  updateProject as updateProjectRepo,
} from "../repositories/projects.js";
import type { AdminProjectListItem, AdminProjectMemberListItem } from "./admin-list.types.js";
import { resolveMemberPhotoViews } from "./member-photo.service.js";

export type { ProjectAdminInput } from "../repositories/projects.js";

function memberDisplayName(row: { firstName: string; lastName: string; maternalName: string | null }): string {
  return [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" ");
}

export async function listProjects(statusCode?: ProjectStatusCode) {
  return listProjectsRepo(statusCode);
}

export async function listProjectsLocalized(locale: Locale, statusCode?: ProjectStatusCode) {
  const projects = await listProjectsLocalizedRows(locale, statusCode);
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

export { toAdminProjectView };

export async function getProject(id: number) {
  return getProjectRepo(id);
}

export async function getProjectLocalized(id: number, locale: Locale) {
  return getProjectLocalizedRepo(id, locale);
}

export async function searchProjects(q: string, locale: Locale = DEFAULT_LOCALE, statusCode?: ProjectStatusCode) {
  return searchProjectsRepo(q, locale, statusCode);
}

export async function createProject(data: ProjectAdminInput) {
  return createProjectRepo(data);
}

export async function updateProject(id: number, data: ProjectAdminInput) {
  await updateProjectRepo(id, data);
}

export async function deleteProject(id: number) {
  await deleteProjectRepo(id);
}

export async function endProject(id: number) {
  await endProjectRepo(id);
}

export async function restartProject(id: number) {
  await restartProjectRepo(id);
}

export async function listProjectMembers(projectId: number) {
  return listProjectMembersRepo(projectId);
}

export async function listMemberProjects(memberId: number) {
  return listMemberProjectsRepo(memberId);
}

export async function addMemberToProject(projectId: number, memberId: number) {
  await addMemberToProjectRepo(projectId, memberId);
}

export async function removeMemberFromProject(projectId: number, memberId: number) {
  await removeMemberFromProjectRepo(projectId, memberId);
}
