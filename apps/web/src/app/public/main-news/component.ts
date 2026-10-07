import { NgClass } from "@angular/common";
import { Component, OnInit, HostListener, inject, ChangeDetectionStrategy } from "@angular/core";
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

  public newsItems: PublicNewsCard[] = [];
  public newsTypes: NewsTypeFilter[] = [];
  public screenWidth: number;
  public total = 0;
  url: string;

  constructor() {
    this.screenWidth = this.browser.innerWidth();
    this.url = GLOBAL.url;
  }

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this.browser.innerWidth();
  }

  public selectedCategoryCode: "general" | "research" | "event" | null = null;
  public selectedCategoryName = "";
  public page = 1;
  public pageSize = 10;
  language: any = {};
  allCharged = false;

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
    this.loadNews();
  }

  loadNews(): void {
    this.allCharged = false;
    this.newsService
      .listNews({
        newsKindCode: this.selectedCategoryCode ?? undefined,
        sortBy: "publishedAt",
        sortOrder: "desc",
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe((response) => {
        this.newsItems = response.items.map((n): PublicNewsCard => {
          const d = new Date(n.publishedAt ?? "");
          if (String(d) !== "Invalid Date") {
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          }
          const fechaFormateada =
            String(d) === "Invalid Date"
              ? ""
              : (new Intl.DateTimeFormat("es", { month: "long", day: "2-digit", year: "numeric" }).format(d) ?? "");

          return Object.assign({} as PublicNewsCard, n, {
            newsTypeNameLabel: n.newsKindName,
            publishedAtLabel: fechaFormateada,
            authorNameLabel: n.authorName,
          });
        });
        this.total = response.total;
        this.allCharged = true;
      });
  }

  selectCategory(code: "general" | "research" | "event" | null, name: string): void {
    this.selectedCategoryCode = code;
    this.selectedCategoryName = name;
    this.page = 1;
    this.loadNews();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadNews();
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
