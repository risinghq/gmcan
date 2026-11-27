import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { primaryName } from "@app/shared/forms/locale-form";
import type { AdminMemberListItem } from "@app/shared/models/admin-list";
import type { Derive } from "@app/shared/routing/derived-data";
import { type AdminEvent, EventService, type EventItem } from "@app/shared/services/event.service";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import { ProjectService } from "@app/shared/services/project.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { type AdminUniversity, type JournalItem, RefService } from "@app/shared/services/ref.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { personName } from "@app/shared/utils/person-name";
import type { AdminMember, AdminNews, AdminProject, AdminPublication, AuthorCandidate } from "@gmcan/contracts/admin";
import { map } from "rxjs";

import { byId } from "./content/forms/content.resolvers";

export type ToolbarBadge = {
  label: string;
  tone: "published" | "draft";
};

export const memberResolver: ResolveFn<AdminMember> = (route) =>
  inject(MemberService).getAdminMember(Number(route.paramMap.get("id")));

export const ownProfileResolver: ResolveFn<AdminMember> = () => inject(MemberService).getOwnProfile();

export const adminMembersResolver: ResolveFn<AdminMemberListItem[]> = () => inject(MemberService).listAdminMembers();

export const authorCandidatesResolver: ResolveFn<AuthorCandidate[]> = () => inject(MemberService).searchAuthors("");

export const adminEventsResolver: ResolveFn<EventItem[]> = () => inject(EventService).listAdmin();

export interface ResearchLineOption {
  id: number;
  name: string;
}

export const adminResearchLinesResolver: ResolveFn<ResearchLineOption[]> = () =>
  inject(ResearchLinesService)
    .listAdmin()
    .pipe(map((lines) => lines.map(({ id, translations }) => ({ id, name: primaryName(translations) }))));

export const journalItemResolver: ResolveFn<JournalItem | null> = (route) => {
  const refs = inject(RefService);
  return byId(route, (id) => refs.getJournal(id));
};

export const universityItemResolver: ResolveFn<AdminUniversity | null> = (route) => {
  const refs = inject(RefService);
  return byId(route, (id) => refs.getUniversity(id));
};

export const eventItemResolver: ResolveFn<AdminEvent | null> = (route) => {
  const events = inject(EventService);
  return byId(route, (id) => events.get(id));
};

export const projectItemResolver: ResolveFn<AdminProject | null> = (route) => {
  const projects = inject(ProjectService);
  return byId(route, (id) => projects.getAdminProject(id));
};

export const publicationItemResolver: ResolveFn<AdminPublication | null> = (route) => {
  const publications = inject(PublicationService);
  return byId(route, (id) => publications.getAdminPublication(id));
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
  const member = data["item"] as AdminMember;
  const isFormer = route.queryParamMap.get("returnTo") === "miembros-antiguos";
  const section = isFormer ? "Miembros Antiguos" : "Miembros Activos";
  return `${section} - ${personName(member)}`;
};

export const projectEditTitle: Derive<string> = (data) =>
  `Proyectos - ${(data["item"] as AdminProject).translations["es"]?.title ?? ""}`;

export function publicationEditTitle(section: string): Derive<string> {
  return (data) => `${section} - ${(data["item"] as AdminPublication).translations["es"]?.title ?? ""}`;
}
