import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import type { MemberFull } from "@app/shared/models/member";
import type { News } from "@app/shared/models/news";
import type { Project } from "@app/shared/models/project";
import type { PublicationWithAuthors } from "@app/shared/models/publication";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import { ProjectService } from "@app/shared/services/project.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { map, of } from "rxjs";

export type ToolbarBadge = {
  label: string;
  tone: "published" | "draft";
};

export const memberResolver: ResolveFn<MemberFull> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(MemberService).getMemberFull(id);
};

export const projectResolver: ResolveFn<Project> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(ProjectService).getProject(id);
};

export const publicationResolver: ResolveFn<PublicationWithAuthors> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(PublicationService).getPublication(id);
};

export const newsResolver: ResolveFn<News> = (route) => {
  const id = Number(route.paramMap.get("id") ?? 0);
  return inject(NewsService).getAdminNews(id);
};

export const newsToolbarBadgeResolver: ResolveFn<ToolbarBadge | null> = (route) =>
  of(route.data["news"] as News).pipe(
    map((news) =>
      (news.status ?? 0) === 1
        ? ({ label: "Noticia Publicada", tone: "published" } as ToolbarBadge)
        : ({ label: "Borrador", tone: "draft" } as ToolbarBadge),
    ),
  );

export const memberEditTitleResolver: ResolveFn<string> = (route) =>
  of(route.data["member"] as MemberFull).pipe(
    map((member) => {
      const isFormer = route.queryParamMap.get("returnTo") === "miembros-antiguos";
      const section = isFormer ? "Miembros Antiguos" : "Miembros Activos";
      const name = [member.firstName, member.lastName, member.maternalName].filter(Boolean).join(" ");
      return `${section} - ${name}`;
    }),
  );

export const projectEditTitleResolver: ResolveFn<string> = (route) =>
  of(route.data["project"] as Project).pipe(map((project) => `Proyectos - ${project.title}`));

export const publicationEditTitleResolver: ResolveFn<string> = (route) =>
  of(route.data["publication"] as PublicationWithAuthors).pipe(
    map((publication) => {
      const path = route.routeConfig?.path ?? "";
      const entity = path.startsWith("edit-thesis")
        ? "Tesis"
        : path.startsWith("edit-resumen")
          ? "Resúmenes"
          : "Artículos";
      return `${entity} - ${publication.title}`;
    }),
  );
