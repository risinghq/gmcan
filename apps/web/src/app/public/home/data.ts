import { Injectable, inject } from "@angular/core";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
import type { PublicNewsListItem } from "@app/shared/models/news";
import type { ProjectWithMembers } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { NewsService } from "@app/shared/services/news.service";
import { ProjectService } from "@app/shared/services/project.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel, dateText } from "@app/shared/utils/date";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { firstValueFrom } from "rxjs";

import type { HomeNewsItem, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

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
  private readonly session = inject(SessionService);

  async load(): Promise<HomeViewModel> {
    const [group, publicacionesRaw, proyectosRaw, newsRaw, lineasRaw, metodosRaw, miembrosRaw] = await Promise.all([
      firstValueFrom(this.groupService.getGroup()),
      firstValueFrom(this.publicationService.listPublications()),
      firstValueFrom(this.projectService.listProjects()),
      firstValueFrom(
        this.newsService.listNews({
          sortBy: "publishedAt",
          sortOrder: "desc",
          page: 1,
          pageSize: 6,
        }),
      ),
      firstValueFrom(this.researchLinesService.list()),
      firstValueFrom(this.methodsService.list()),
      firstValueFrom(this.memberService.listMembers()),
    ]);

    const lineasInvestigacion = Array.isArray(lineasRaw) ? (lineasRaw as ResearchLine[]) : [];
    const metodos = Array.isArray(metodosRaw) ? (metodosRaw as Method[]) : [];
    const miembros = Array.isArray(miembrosRaw) ? (miembrosRaw as Member[]) : [];
    const publicacionesSafe = Array.isArray(publicacionesRaw)
      ? (publicacionesRaw as PublicPublicationWithAuthors[])
      : [];
    const proyectosSafe = Array.isArray(proyectosRaw) ? (proyectosRaw as ProjectWithMembers[]) : [];
    const newsSafe = Array.isArray(newsRaw?.items) ? (newsRaw.items as PublicNewsListItem[]) : [];

    const aboutUs = group?.id ? await this.loadAboutUs(group.id) : [];

    const publicaciones = this.enrichPublicaciones(publicacionesSafe);
    const proyectos = this.enrichProyectos(
      proyectosSafe.filter((p) => !p.endDate),
      lineasInvestigacion,
    );
    const newsItems = this.enrichNews(newsSafe);

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

    const orderedNews = newsItems.toSorted((a, b) => {
      const left = new Date(a.publishedAt ?? "").getTime();
      const right = new Date(b.publishedAt ?? "").getTime();
      return right - left;
    });

    return {
      info: group,
      publicaciones: orderedPublicaciones,
      proyectos: orderedProyectos,
      newsItems: orderedNews,
      featuredNews: orderedNews[0] ?? null,
      lineasInvestigacion,
      linesPreview: lineasInvestigacion.slice(0, 3),
      metodos,
      miembros,
      aboutUs,
      articulos: orderedPublicaciones.filter((p) => p.kindCode === "journal_article").length,
      tesis: orderedPublicaciones.filter((p) => p.kindCode === "thesis").length,
      resumenes: orderedPublicaciones.filter((p) => p.kindCode === "conference_paper").length,
    };
  }

  private async loadAboutUs(groupId: number): Promise<string[]> {
    try {
      const aboutList = await firstValueFrom(this.groupService.listPublicAbout(groupId));
      return Array.isArray(aboutList) ? (aboutList[0]?.homeServicesTeaserContent?.paragraphs ?? []) : [];
    } catch {
      return [];
    }
  }

  private enrichPublicaciones(publicaciones: PublicPublicationWithAuthors[]): HomePublicacion[] {
    const publicationKinds = this.lookup.publicationKinds();
    const thesisKinds = this.lookup.thesisKinds();
    const journals = this.lookup.journals();
    const universities = this.lookup.universities();
    const events = this.lookup.events();

    const tiposMap = new Map(publicationKinds.map((t) => [t.code, t]));
    const tiposTesisMap = new Map(thesisKinds.map((t) => [t.code, t]));
    const revistasMap = new Map(journals.map((j) => [j.id, j]));
    const universidadesMap = new Map(universities.map((u) => [u.id, u]));
    const eventosMap = new Map(events.map((e) => [e.id, e]));

    return publicaciones.map((pub) => {
      const eventId = pub.subtype.kindCode === "conference_paper" ? pub.subtype.conferencePaper.eventId : null;
      const universityId = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.universityId : null;
      const thesisKindCode = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.thesisKindCode : null;
      const journalId = pub.subtype.kindCode === "journal_article" ? pub.subtype.journalArticle.journalId : null;
      const evento = eventId ? eventosMap.get(eventId) : undefined;

      return {
        ...pub,
        fecha: dateLabel(pub.publishedAt, "MMMM y", this.session.language().locale),
        tipoPublicacion: tiposMap.get(pub.kindCode)?.name,
        tipoTesis: thesisKindCode ? tiposTesisMap.get(thesisKindCode)?.name : undefined,
        revista: journalId ? revistasMap.get(journalId)?.name : undefined,
        universidad: universityId ? (universidadesMap.get(universityId)?.name ?? undefined) : undefined,
        evento: evento?.name,
        ciudad: evento?.city ?? null,
        pais: evento?.country ?? null,
      };
    });
  }

  private enrichProyectos(proyectos: ProjectWithMembers[], lineas: ResearchLine[]): HomeProyecto[] {
    const fundingSources = this.lookup.fundingSources();
    const monedas = this.lookup.currencies();

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(fundingSources.map((f) => [f.code, f]));
    const monedasMap = new Map(monedas.map((m) => [m.code, m]));

    const locale = this.session.language().locale;
    return proyectos.map((proyecto) => {
      return {
        ...proyecto,
        fechaI: dateLabel(proyecto.startDate, "MMMM, y", locale),
        fechaF: dateLabel(proyecto.endDate, "MMMM, y", locale) || undefined,
        lineasInvestigacion: lineasMap.get(proyecto.researchLineId)?.name,
        fuenteFinanciamiento: fuentesMap.get(proyecto.fundingSourceCode)?.name,
        moneda: monedasMap.get(proyecto.currencyCode)?.symbol,
        members: proyecto.members ?? [],
      };
    });
  }

  private enrichNews(newsItems: PublicNewsListItem[]): HomeNewsItem[] {
    return newsItems.map((newsItem) => {
      return {
        ...newsItem,
        publishedAtLabel: dateText(newsItem.publishedAt, "MMMM dd, y", this.session.language().locale),
        newsTypeNameLabel: newsItem.newsKindName,
        authorNameLabel: newsItem.authorName,
      };
    });
  }
}
