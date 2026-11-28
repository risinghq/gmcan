import { Component, OnInit, inject, ChangeDetectionStrategy, computed, signal } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, MatSortHeader, Sort } from "@angular/material/sort";
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from "@angular/material/table";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { EmptyListComponent } from "@app/shared/components/empty-list.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PersonComponent } from "@app/shared/components/person.component";
import type { AdminNewsListItem, AdminNewsSortBy } from "@app/shared/models/admin-list";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { PAGE_SIZE } from "@app/shared/tables/list-table";
import { dateText } from "@app/shared/utils/date";

interface NewsListItem {
  id: number;
  title: string;
  publishedAtLabel: string;
  categoryName: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorPhotoAlt: string;
  statusCode: "draft" | "published" | "archived";
  statusLabel: string;
}

@Component({
  selector: "app-news-list",
  templateUrl: "./noticias.component.html",
  styleUrl: "./noticias.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyListComponent,
    PersonComponent,
    MatTabGroup,
    MatTab,
    IconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
  ],
})
export default class NewsListComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly lookup = inject(LookupService);
  private readonly router = inject(Router);
  private readonly tabState = inject(TabStateService);

  displayedColumns: string[] = ["title", "publishedAtLabel", "categoryName", "authorName", "status"];
  displayedColumns2: string[] = ["name"];
  selectedTab = 0;

  readonly items = signal<NewsListItem[] | null>(null);
  readonly total = signal(0);
  pageSize = PAGE_SIZE;
  readonly PAGE_SIZE = PAGE_SIZE;
  pageIndex = 0;
  search = "";
  statusFilter: "" | "draft" | "published" | "archived" = "";
  newsTypeFilter = "";
  sortBy: AdminNewsSortBy = "publishedAt";
  sortOrder: "asc" | "desc" = "desc";

  get filtering(): boolean {
    return this.search !== "" || this.statusFilter !== "" || this.newsTypeFilter !== "";
  }

  readonly newsTypes = computed(() => this.lookup.newsKinds());
  protected readonly categorySearch = signal("");
  readonly filteredNewsTypes = computed(() => {
    const search = this.categorySearch();
    return this.newsTypes().filter((x) => x.name.toLowerCase().includes(search));
  });

  private loadNews(): void {
    this.newsService
      .listAdminNews({
        q: this.search || undefined,
        statusCode: this.statusFilter === "" ? undefined : this.statusFilter,
        newsKindCode:
          this.newsTypeFilter === "" ? undefined : (this.newsTypeFilter as "general" | "research" | "event"),
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
      })
      .subscribe((response) => {
        this.items.set(response.items.map((item) => this.mapNewsItem(item)));
        this.total.set(response.total);
      });
  }

  private mapNewsItem(news: AdminNewsListItem): NewsListItem {
    return {
      id: news.id,
      title: news.title,
      publishedAtLabel: dateText(news.publishedAt, "mediumDate", "es"),
      categoryName: news.categoryName,
      authorName: news.authorName,
      authorPhotoUrl: news.authorPhotoUrl,
      authorPhotoAlt: news.authorPhotoAlt,
      statusCode: news.statusCode,
      statusLabel: news.statusLabel,
    };
  }

  onSearchChange(event: Event): void {
    this.search = (event.target as HTMLInputElement).value.trim();
    this.pageIndex = 0;
    this.loadNews();
  }

  onStatusChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as "" | "draft" | "published" | "archived";
    this.pageIndex = 0;
    this.loadNews();
  }

  onNewsTypeChange(event: Event): void {
    this.newsTypeFilter = (event.target as HTMLSelectElement).value;
    this.pageIndex = 0;
    this.loadNews();
  }

  onSortChange(event: Sort): void {
    const order = event.direction === "asc" || event.direction === "desc" ? event.direction : "desc";
    const map: Record<string, AdminNewsSortBy> = {
      title: "title",
      publishedAtLabel: "publishedAt",
      categoryName: "categoryName",
      authorName: "authorName",
      status: "statusCode",
    };
    this.sortBy = map[event.active] ?? "publishedAt";
    this.sortOrder = order;
    this.pageIndex = 0;
    this.loadNews();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNews();
  }

  onCategorySearch(event: Event): void {
    this.categorySearch.set((event.target as HTMLInputElement).value.trim().toLowerCase());
  }

  addNews(): void {
    this.router.navigate(["dashboard/add-news"]);
  }

  editNews(id: number): void {
    this.router.navigate(["dashboard/edit-news/" + id]);
  }

  changedTab(event: number): void {
    this.tabState.newsTab.set(event);
  }

  ngOnInit(): void {
    this.selectedTab = this.tabState.newsTab();
    this.loadNews();
  }
}
