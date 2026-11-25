import { NgClass } from "@angular/common";
import { Component, OnInit, HostListener, computed, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateText } from "@app/shared/utils/date";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

type PublicNewsCard = PublicNewsListItem & {
  newsTypeNameLabel: string;
  publishedAtLabel: string;
  authorNameLabel: string;
};
type NewsTypeFilter = { code: "general" | "research" | "event"; name: string };

function toNewsCard(n: PublicNewsListItem, locale: string): PublicNewsCard {
  return {
    ...n,
    newsTypeNameLabel: n.newsKindName,
    publishedAtLabel: dateText(n.publishedAt, "longDate", locale),
    authorNameLabel: n.authorName,
  };
}

@Component({
  selector: "app-main-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
    MatProgressSpinner,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NgClass,
  ],
})
export default class MainNewsComponent implements OnInit {
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  lookup = inject(LookupService);
  router = inject(Router);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private titleService = inject(Title);

  public newsTypes: NewsTypeFilter[] = [];
  public screenWidth: number;
  url: string;

  constructor() {
    this.screenWidth = this.browser.innerWidth();
    this.url = GLOBAL.url;
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
  }

  private readonly query = signal<{ code: NewsTypeFilter["code"] | null; page: number }>({ code: null, page: 1 });
  public selectedCategoryName = "";
  public readonly pageSize = 10;
  language: any = {};

  readonly news = rxResource({
    params: () => this.query(),
    stream: ({ params }) =>
      this.newsService.listNews({
        newsKindCode: params.code ?? undefined,
        sortBy: "publishedAt",
        sortOrder: "desc",
        page: params.page,
        pageSize: this.pageSize,
      }),
  });

  readonly items = computed(() => {
    const locale = this.session.language().locale;
    return (this.news.value()?.items ?? []).map((item) => toNewsCard(item, locale));
  });

  get selectedCategoryCode(): NewsTypeFilter["code"] | null {
    return this.query().code;
  }

  get page(): number {
    return this.query().page;
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | " + this.language.news);
    this.selectedCategoryName = this.language.newsText[0].categoryTitle;
    this.newsTypes = this.lookup
      .newsKinds()
      .filter(
        (item): item is NewsTypeFilter => item.code === "general" || item.code === "research" || item.code === "event",
      )
      .toSorted((a, b) => (a.name > b.name ? 1 : -1));
  }

  selectCategory(code: NewsTypeFilter["code"] | null, name: string): void {
    this.selectedCategoryName = name;
    this.query.set({ code, page: 1 });
  }

  onPageChange(page: number): void {
    this.query.update((query) => ({ ...query, page }));
    this.scroll();
  }

  openNewsDetail(newsItem: PublicNewsCard): void {
    this.router.navigate(["/home/detail-news/" + newsItem.id], { queryParams: { from: "news" } });
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
