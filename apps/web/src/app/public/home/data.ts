import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { publicationDisplay } from "@app/shared/publication-display";
import { GLOBAL } from "@app/shared/services/global";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel, dateText } from "@app/shared/utils/date";
import type { PublicHome, PublicNewsListItem, PublicProject } from "@gmcan/contracts/public";
import { firstValueFrom } from "rxjs";

import type { HomeNewsItem, HomeProyecto, HomeViewModel } from "./types";

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
      publicaciones: home.publications.map(publicationDisplay(this.lookup, this.session.language().locale)),
      proyectos: this.enrichProyectos(home.ongoingProjects),
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

  private enrichProyectos(proyectos: PublicProject[]): HomeProyecto[] {
    const locale = this.session.language().locale;
    return proyectos.map((proyecto) => ({
      ...proyecto,
      fechaI: dateLabel(proyecto.startDate, "MMMM y", locale),
      fechaF: dateLabel(proyecto.endDate, "MMMM y", locale) || undefined,
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
