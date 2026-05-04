import { DatePipe, TitleCasePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
import type { News } from "@app/shared/models/news";
import type { ProjectWithMembers } from "@app/shared/models/project";
import type { PublicationWithAuthors } from "@app/shared/models/publication";
import type { ResearchLine } from "@app/shared/models/research-line";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { NewsService } from "@app/shared/services/news.service";
import { ProjectService } from "@app/shared/services/project.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { firstValueFrom } from "rxjs";

import type { HomeNoticia, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class HomeDataService {
  private readonly groupService = inject(GroupService);
  private readonly publicationService = inject(PublicationService);
  private readonly projectService = inject(ProjectService);
  private readonly newsService = inject(NewsService);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly methodsService = inject(MethodsService);
  private readonly memberService = inject(MemberService);
  private readonly lookup = inject(LookupService);
  private readonly datePipe = inject(DatePipe);
  private readonly titlecasePipe = inject(TitleCasePipe);

  async load(): Promise<HomeViewModel> {
    const [group, publicacionesRaw, proyectosRaw, noticiasRaw, lineasRaw, metodosRaw, miembrosRaw] = await Promise.all([
      firstValueFrom(this.groupService.getGroup()),
      firstValueFrom(this.publicationService.listPublications()),
      firstValueFrom(this.projectService.listProjects()),
      firstValueFrom(this.newsService.listNews(1)),
      firstValueFrom(this.researchLinesService.list()),
      firstValueFrom(this.methodsService.list()),
      firstValueFrom(this.memberService.listMembers()),
    ]);

    const lineasInvestigacion = Array.isArray(lineasRaw) ? (lineasRaw as ResearchLine[]) : [];
    const metodos = Array.isArray(metodosRaw) ? (metodosRaw as Method[]) : [];
    const miembros = Array.isArray(miembrosRaw) ? (miembrosRaw as Member[]) : [];
    const publicacionesSafe = Array.isArray(publicacionesRaw) ? (publicacionesRaw as PublicationWithAuthors[]) : [];
    const proyectosSafe = Array.isArray(proyectosRaw) ? (proyectosRaw as ProjectWithMembers[]) : [];
    const noticiasSafe = Array.isArray(noticiasRaw) ? (noticiasRaw as News[]) : [];

    const aboutUs = group?.id ? await this.loadAboutUs(group.id) : "";

    const publicaciones = this.enrichPublicaciones(publicacionesSafe);
    const proyectos = this.enrichProyectos(
      proyectosSafe.filter((p) => !p.endDate),
      lineasInvestigacion,
    );
    const noticias = this.enrichNoticias(noticiasSafe, miembros);

    const orderedPublicaciones = publicaciones.toSorted((a, b) => {
      const left = new Date(a.publishedAt ?? "").getTime();
      const right = new Date(b.publishedAt ?? "").getTime();
      return right - left;
    });

    const orderedProyectos = proyectos.toSorted((a, b) => {
      const left = new Date(a.startDate ?? "").getTime();
      const right = new Date(b.startDate ?? "").getTime();
      return right - left;
    });

    const orderedNoticias = noticias.toSorted((a, b) => {
      const left = new Date(a.publishedAt ?? "").getTime();
      const right = new Date(b.publishedAt ?? "").getTime();
      return right - left;
    });

    return {
      info: group,
      publicaciones: orderedPublicaciones,
      proyectos: orderedProyectos,
      noticias: orderedNoticias,
      noticiaPrincipal: orderedNoticias[0] ?? null,
      lineasInvestigacion,
      metodos,
      miembros,
      aboutUs,
      articulos: orderedPublicaciones.filter((p) => p.typeId === 1).length,
      tesis: orderedPublicaciones.filter((p) => p.typeId === 2).length,
      resumenes: orderedPublicaciones.filter((p) => p.typeId === 3).length,
    };
  }

  private async loadAboutUs(groupId: number): Promise<string> {
    try {
      const aboutList = await firstValueFrom(this.groupService.listPublicAbout(groupId));
      return Array.isArray(aboutList) ? (aboutList[0]?.services ?? "") : "";
    } catch {
      return "";
    }
  }

  private enrichPublicaciones(publicaciones: PublicationWithAuthors[]): HomePublicacion[] {
    const publicationTypes = this.lookup.publicationTypes();
    const thesisTypes = this.lookup.thesisTypes();
    const journals = this.lookup.journals();
    const universities = this.lookup.universities();
    const events = this.lookup.events();

    const tiposMap = new Map(publicationTypes.map((t) => [t.id, t]));
    const tiposTesisMap = new Map(thesisTypes.map((t) => [t.id, t]));
    const revistasMap = new Map(journals.map((j) => [j.id, j]));
    const universidadesMap = new Map(universities.map((u) => [u.id, u]));
    const eventosMap = new Map(events.map((e) => [e.id, e]));

    return publicaciones.map((pub) => {
      const publishedAt = this.normalizedDate(pub.publishedAt);
      const evento = pub.eventId ? eventosMap.get(pub.eventId) : undefined;

      return {
        ...pub,
        fecha: !publishedAt
          ? ""
          : (this.titlecasePipe.transform(this.datePipe.transform(publishedAt, "MMMM y", "es") ?? "") ?? ""),
        tipoPublicacion: tiposMap.get(pub.typeId)?.name,
        tipoTesis: pub.thesisTypeId ? tiposTesisMap.get(pub.thesisTypeId)?.name : undefined,
        revista: pub.journalId ? revistasMap.get(pub.journalId)?.name : undefined,
        universidad: pub.universityId ? (universidadesMap.get(pub.universityId)?.name ?? undefined) : undefined,
        evento: evento?.name,
        ciudad: evento?.city ?? null,
        pais: evento?.country ?? null,
      };
    });
  }

  private enrichProyectos(proyectos: ProjectWithMembers[], lineas: ResearchLine[]): HomeProyecto[] {
    const fundingSources = this.lookup.fundingSources();
    const monedas = this.lookup.monedas();

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(fundingSources.map((f) => [f.id, f]));
    const monedasMap = new Map(monedas.map((m) => [m.idMoneda, m]));

    return proyectos.map((proyecto) => {
      const startDate = this.normalizedDate(proyecto.startDate);

      let fechaF: string | undefined;
      if (proyecto.endDate) {
        const endDate = this.normalizedDate(proyecto.endDate);
        if (endDate) {
          fechaF = this.titlecasePipe.transform(this.datePipe.transform(endDate, "MMMM, y", "es") ?? "") ?? undefined;
        }
      }

      return {
        ...proyecto,
        fechaI: !startDate
          ? ""
          : (this.titlecasePipe.transform(this.datePipe.transform(startDate, "MMMM, y", "es") ?? "") ?? ""),
        fechaF,
        lineasInvestigacion: lineasMap.get(proyecto.researchLineId)?.name,
        fuenteFinanciamiento: fuentesMap.get(proyecto.fundingSourceId)?.name,
        moneda: monedasMap.get(proyecto.currencyId)?.simbolo,
        members: proyecto.members ?? [],
      };
    });
  }

  private enrichNoticias(noticias: News[], miembros: Member[]): HomeNoticia[] {
    const newsTypes = this.lookup.newsTypes();
    const tiposMap = new Map(newsTypes.map((t) => [t.id, t]));
    const miembrosMap = new Map(miembros.map((m) => [m.id, m]));

    return noticias.map((noticia) => {
      const publishedAt = this.normalizedDate(noticia.publishedAt);

      const autor = noticia.authorId ? miembrosMap.get(noticia.authorId) : undefined;
      const autorName = autor ? `${autor.firstName} ${autor.lastName}`.trim() : "";

      return {
        ...noticia,
        fechaPublicacion: !publishedAt ? "" : (this.datePipe.transform(publishedAt, "MMMM dd, y", "es") ?? ""),
        nombreTipoNoticia: noticia.newsTypeId ? (tiposMap.get(noticia.newsTypeId)?.name ?? "") : "",
        autor: autorName,
      };
    });
  }

  private normalizedDate(value: string | null | undefined): Date | null {
    const date = new Date(value ?? "");
    if (Number.isNaN(date.getTime())) return null;
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  }
}
