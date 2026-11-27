import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { MatButton } from "@angular/material/button";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import type { PublicNewsListItem } from "@app/shared/models/news";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { SeoService } from "@app/shared/services/seo.service";
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
    RouterLink,
    IconComponent,
    MatProgressSpinner,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
  ],
})
export default class MainNewsComponent implements OnInit {
  newsService = inject(NewsService);
  route = inject(ActivatedRoute);
  lookup = inject(LookupService);
  private browser = inject(BrowserService);
  private session = inject(SessionService);
  private seo = inject(SeoService);

  public newsTypes: NewsTypeFilter[] = [];
  url = GLOBAL.url;

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
    this.seo.setPageTitle("GMCAN | " + this.language.news);
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

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
