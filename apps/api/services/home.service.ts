import { HOME_NEWS, HOME_PROJECTS, HOME_PUBLICATIONS, type PublicHome } from "@gmcan/contracts/public";

import type { Locale } from "../lib/public-locale.js";
import {
  listAboutLocalized,
  listGroupsLocalized,
  listPublicMethods,
  listPublicResearchLines,
} from "./group.service.js";
import { listMembersLocalized } from "./member.service.js";
import { listPublicNews } from "./news.service.js";
import { listProjectsLocalized } from "./project.service.js";
import { countPublicationsByKind, listPublications } from "./publication.service.js";

async function services(locale: Locale): Promise<string[]> {
  const [group] = await listGroupsLocalized(locale);
  if (!group) return [];
  const [about] = await listAboutLocalized(group.id, locale);
  if (!about) return [];
  return [...about.servicesContent.introParagraphs, ...about.servicesContent.items];
}

async function ongoingProjects(locale: Locale) {
  const projects = await listProjectsLocalized(locale);
  return projects
    .filter((project) => !project.endDate)
    .toSorted((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, HOME_PROJECTS);
}

export async function getHome(locale: Locale): Promise<PublicHome> {
  const [members, publicationCounts, publications, projects, news, researchLines, methods, serviceLines] =
    await Promise.all([
      listMembersLocalized(locale),
      countPublicationsByKind(),
      listPublications(locale, { limit: HOME_PUBLICATIONS }),
      ongoingProjects(locale),
      listPublicNews(locale, { sortBy: "publishedAt", sortOrder: "desc", page: 1, pageSize: HOME_NEWS }),
      listPublicResearchLines(locale),
      listPublicMethods(locale),
      services(locale),
    ]);

  return {
    memberCount: members.length,
    publicationCounts,
    publications,
    ongoingProjects: projects,
    news: news.items,
    researchLines,
    methods,
    services: serviceLines,
  };
}
