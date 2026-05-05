import { SlicePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { parsePublicOrigin } from "@app/shared/routing/public-origin";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { parseLocalDate } from "@app/shared/utils/date";

type NewsDisplay = PublicNewsListItem & {
  newsTypeNameLabel: string;
  publishedAtLabel: string;
  authorNameLabel: string;
};

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrl: "./news.component.scss",
  imports: [SlicePipe],
})
export default class NewsComponent implements OnInit {
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private browser = inject(BrowserService);
  private session = inject(SessionService);

  public newsItems: NewsDisplay[] = [];
  public featuredNews: NewsDisplay | null = null;
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  numberShown = 5;

  @HostListener("window:resize", ["$event"])
  onResize(event: Event): void {
    void event;
    this.numberShown = this.browser.innerWidth() >= 1300 ? 10 : 5;
  }

  public title = "";
  public selectedNewsId = 0;
  language: any = {};

  ngOnInit(): void {
    this.language = this.session.language();
    this.numberShown = this.browser.innerWidth() >= 1300 ? 10 : 5;
    this.selectedNewsId = Number(this.route.snapshot.params["id"]) || 0;
    this.loadNoticias();
  }

  ngDoCheck(): void {
    this.title = this.language.news;
    if (this.router.url.includes("/detail-news")) {
      this.title = this.language.moreNews;
    }
  }

  loadNoticias(): void {
    this.newsService
      .listNews({
        status: 1,
        sortBy: "publishedAt",
        sortOrder: "desc",
        page: 1,
        pageSize: 30,
      })
      .subscribe((response) => {
        const enriched = response.items
          .filter((n) => n.id !== this.selectedNewsId)
          .toSorted((a, b) => {
            const left = parseLocalDate(a.publishedAt)?.getTime() ?? 0;
            const right = parseLocalDate(b.publishedAt)?.getTime() ?? 0;
            return right - left;
          })
          .map((n): NewsDisplay => {
            const publishedAtDate = parseLocalDate(n.publishedAt);
            const fechaFormateada = !publishedAtDate
              ? ""
              : (new Intl.DateTimeFormat("es", { month: "long", day: "2-digit", year: "numeric" }).format(
                  publishedAtDate,
                ) ?? "");

            return Object.assign({} as NewsDisplay, n, {
              newsTypeNameLabel: n.newsTypeName,
              publishedAtLabel: fechaFormateada,
              authorNameLabel: n.authorName,
            });
          });

        this.featuredNews = enriched[0] ?? null;
        this.newsItems = enriched.slice(1);
      });
  }

  openNewsDetail(newsItem: NewsDisplay): void {
    const origin = parsePublicOrigin(this.route);
    this.router.navigate(["/home/detail-news/" + newsItem.id], { queryParams: { from: origin } });
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
