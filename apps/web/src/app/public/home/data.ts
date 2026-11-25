import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel, dateText } from "@app/shared/utils/date";
import type {
  PublicGroupTopic,
  PublicHome,
  PublicNewsListItem,
  PublicProject,
  PublicPublicationWithAuthors,
} from "@gmcan/contracts/public";
import { firstValueFrom } from "rxjs";

import type { HomeNewsItem, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class HomeDataService {
  private readonly http = inject(HttpClient);
  private readonly groupService = inject(GroupService);
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);

  async load(): Promise<HomeViewModel> {
    const [group, home] = await Promise.all([
      firstValueFrom(this.groupService.getGroup()),
      firstValueFrom(this.http.get<PublicHome>(GLOBAL.api("home"))),
    ]);
    const newsItems = this.enrichNews(home.news);

    return {
      info: group,
      publicaciones: this.enrichPublicaciones(home.publications),
      proyectos: this.enrichProyectos(home.ongoingProjects, home.researchLines),
      newsItems,
      featuredNews: newsItems[0] ?? null,
      linesPreview: home.researchLines.slice(0, 3),
      metodos: home.methods,
      memberCount: home.memberCount,
      aboutUs: home.services,
      articulos: home.publicationCounts.journal_article,
      tesis: home.publicationCounts.thesis,
      resumenes: home.publicationCounts.conference_paper,
    };
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

  private enrichProyectos(proyectos: PublicProject[], lineas: PublicGroupTopic[]): HomeProyecto[] {
    const fundingSources = this.lookup.fundingSources();
    const monedas = this.lookup.currencies();

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(fundingSources.map((f) => [f.code, f]));
    const monedasMap = new Map(monedas.map((m) => [m.code, m]));

    const locale = this.session.language().locale;
    return proyectos.map((proyecto) => ({
      ...proyecto,
      fechaI: dateLabel(proyecto.startDate, "MMMM, y", locale),
      fechaF: dateLabel(proyecto.endDate, "MMMM, y", locale) || undefined,
      lineasInvestigacion: lineasMap.get(proyecto.researchLineId)?.name,
      fuenteFinanciamiento: fuentesMap.get(proyecto.fundingSourceCode)?.name,
      moneda: monedasMap.get(proyecto.currencyCode)?.symbol,
    }));
  }

  private enrichNews(newsItems: PublicNewsListItem[]): HomeNewsItem[] {
    return newsItems.map((newsItem) => ({
      ...newsItem,
      publishedAtLabel: dateText(newsItem.publishedAt, "longDate", this.session.language().locale),
      newsTypeNameLabel: newsItem.newsKindName,
      authorNameLabel: newsItem.authorName,
    }));
  }
}
