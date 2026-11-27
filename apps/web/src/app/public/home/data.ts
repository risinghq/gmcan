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

import type { HomeCounter, HomeNewsItem, HomeProyecto, HomeViewModel } from "./types";

type CounterLabels = Record<"members" | "articles" | "theses" | "abstracts", Record<"one" | "other", string>>;

export function homeCounters(
  home: Pick<PublicHome, "memberCount" | "publicationCounts">,
  language: { locale: string; counters: CounterLabels },
): HomeCounter[] {
  const plural = new Intl.PluralRules(language.locale);
  const counter = (value: number, labels: Record<"one" | "other", string>, link: string): HomeCounter => ({
    value,
    label: plural.select(value) === "one" ? labels.one : labels.other,
    link,
  });
  const { counters } = language;
  const counts = home.publicationCounts;

  return [
    counter(home.memberCount, counters.members, "/members"),
    counter(counts.journal_article, counters.articles, "/publications"),
    counter(counts.thesis, counters.theses, "/publications"),
    counter(counts.conference_paper, counters.abstracts, "/publications"),
  ];
}

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
      counters: homeCounters(home, this.session.language()),
      aboutUs: home.services,
    };
  }

  private enrichProyectos(proyectos: PublicProject[]): HomeProyecto[] {
    const locale = this.session.language().locale;
    return proyectos.map((proyecto) => ({
      ...proyecto,
      fechaI: dateLabel(proyecto.startDate, "MMMM y", locale),
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
