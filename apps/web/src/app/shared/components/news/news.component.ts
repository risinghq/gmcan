import { SlicePipe } from "@angular/common";
import { Component, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, ActivatedRoute, NavigationEnd, RouterLink } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { parsePublicOrigin } from "@app/shared/routing/public-origin";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateText, parseLocalDate } from "@app/shared/utils/date";
import { filter, map, startWith } from "rxjs";

type NewsDisplay = PublicNewsListItem & {
  newsTypeNameLabel: string;
  publishedAtLabel: string;
  authorNameLabel: string;
};

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrl: "./news.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, RouterLink],
})
export default class NewsComponent {
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private session = inject(SessionService);

  private readonly selectedNewsId = toSignal(this.route.paramMap.pipe(map((params) => Number(params.get("id")) || 0)), {
    initialValue: Number(this.route.snapshot.params["id"]) || 0,
  });
  readonly origin = parsePublicOrigin(this.route.snapshot.queryParamMap.get("from"));
  readonly language = this.session.language;
  readonly isDetailNews = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.includes("/detail-news")),
      startWith(this.router.url.includes("/detail-news")),
    ),
    { initialValue: this.router.url.includes("/detail-news") },
  );
  private readonly newsResponse = toSignal(
    this.newsService.listNews({
      sortBy: "publishedAt",
      sortOrder: "desc",
      page: 1,
      pageSize: 30,
    }),
  );
  readonly vm = computed(() => {
    const response = this.newsResponse();
    const locale = this.language().locale;
    if (!response) {
      return { featuredNews: null as NewsDisplay | null, newsItems: [] as NewsDisplay[] };
    }

    const enriched = response.items
      .filter((n) => n.id !== this.selectedNewsId())
      .toSorted((a, b) => {
        const left = parseLocalDate(a.publishedAt)?.getTime() ?? 0;
        const right = parseLocalDate(b.publishedAt)?.getTime() ?? 0;
        return right - left;
      })
      .map((n): NewsDisplay =>
        Object.assign({}, n, {
          newsTypeNameLabel: n.newsKindName,
          publishedAtLabel: dateText(n.publishedAt, "longDate", locale),
          authorNameLabel: n.authorName,
        }),
      );

    return {
      featuredNews: enriched[0] ?? null,
      newsItems: enriched.slice(1),
    };
  });
  readonly title = computed(() => (this.isDetailNews() ? this.language().moreNews : this.language().news));
}
