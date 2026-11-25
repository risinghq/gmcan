import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { primaryName } from "@app/shared/forms/locale-form";
import type { AdminMemberListItem, AdminProjectMemberListItem } from "@app/shared/models/admin-list";
import type { AuthorSearchResult } from "@app/shared/models/author";
import type { MemberFull } from "@app/shared/models/member";
import type { Project } from "@app/shared/models/project";
import type { Derive } from "@app/shared/routing/derived-data";
import { EventService, type EventItem } from "@app/shared/services/event.service";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import { ProjectService } from "@app/shared/services/project.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { RefService, type JournalItem } from "@app/shared/services/ref.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import type { AdminNews, RefDependenciesResponse } from "@gmcan/contracts/admin";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { map } from "rxjs";

import { byId } from "./content/forms/content.resolvers";

export type ToolbarBadge = {
  label: string;
  tone: "published" | "draft";
};

export const memberResolver: ResolveFn<MemberFull> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(MemberService).getMemberFull(id);
};

export const adminMembersResolver: ResolveFn<AdminMemberListItem[]> = () => inject(MemberService).listAdminMembers();

export const authorOptionsResolver: ResolveFn<AuthorSearchResult[]> = () => inject(MemberService).searchAuthors("");

export const adminEventsResolver: ResolveFn<EventItem[]> = () => inject(EventService).listAdmin();

/** A research line as a project form offers it: the id it stores and the name the admin picks by. */
export interface ResearchLineOption {
  id: number;
  name: string;
}

export const adminResearchLinesResolver: ResolveFn<ResearchLineOption[]> = () =>
  inject(ResearchLinesService)
    .listAdmin()
    .pipe(map((lines) => lines.map(({ id, translations }) => ({ id, name: primaryName(translations) }))));

export const projectMembersResolver: ResolveFn<AdminProjectMemberListItem[]> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(ProjectService).getProjectMembers(id);
};

export const journalResolver: ResolveFn<JournalItem> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(RefService).getJournal(id);
};

export const journalDependenciesResolver: ResolveFn<RefDependenciesResponse> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(RefService).getJournalDependencies(id);
};

export const projectResolver: ResolveFn<Project> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(ProjectService).getProject(id);
};

export const publicationResolver: ResolveFn<PublicPublicationWithAuthors> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(PublicationService).getPublication(id);
};

export const newsItemResolver: ResolveFn<AdminNews | null> = (route) => {
  const news = inject(NewsService);
  return byId(route, (id) => news.getAdminNews(id));
};

export const newsToolbarBadge: Derive<ToolbarBadge> = (data) =>
  (data["item"] as AdminNews).statusCode === "published"
    ? { label: "Noticia Publicada", tone: "published" }
    : { label: "Borrador", tone: "draft" };

export const memberEditTitle: Derive<string> = (data, route) => {
  const member = data["member"] as MemberFull;
  const isFormer = route.queryParamMap.get("returnTo") === "miembros-antiguos";
  const section = isFormer ? "Miembros Antiguos" : "Miembros Activos";
  const name = [member.firstName, member.lastName, member.maternalName].filter(Boolean).join(" ");
  return `${section} - ${name}`;
};

export const projectEditTitle: Derive<string> = (data) => `Proyectos - ${(data["project"] as Project).title}`;

export function publicationEditTitle(section: string): Derive<string> {
  return (data) => `${section} - ${(data["publication"] as PublicPublicationWithAuthors).title}`;
}
