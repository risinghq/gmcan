import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
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
import type { AdminNewsListItem, AdminNewsSortBy } from "@app/shared/models/admin-list";
import { NewsService } from "@app/shared/services/news.service";
import type { RefItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { parseLocalDate } from "@app/shared/utils/date";

interface NewsListItem {
  id: number;
  title: string;
  publishedAtLabel: string;
  categoryName: string;
  authorName: string;
  authorAsset: string | null;
  statusCode: "draft" | "published" | "archived";
  statusLabel: string;
}

@Component({
  selector: "app-news-list",
  templateUrl: "./noticias.component.html",
  styleUrl: "./noticias.component.scss",
  imports: [
    MatTabGroup,
    MatTab,
    MatIcon,
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
  private readonly refService = inject(RefService);
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private readonly tabState = inject(TabStateService);

  displayedColumns: string[] = ["title", "publishedAtLabel", "categoryName", "authorName", "status"];
  displayedColumns2: string[] = ["name"];
  selectedTab = 0;

  items: NewsListItem[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;
  search = "";
  statusFilter: "" | "draft" | "published" | "archived" = "";
  newsTypeFilter = "";
  sortBy: AdminNewsSortBy = "publishedAt";
  sortOrder: "asc" | "desc" = "desc";

  newsTypes: RefItem[] = [];
  filteredNewsTypes: RefItem[] = [];
  categorySearch = "";

  private loadNewsTypes(): void {
    this.refService.listNewsTypes().subscribe((newsTypes: RefItem[]) => {
      this.newsTypes = newsTypes;
      this.filteredNewsTypes = newsTypes;
    });
  }

  private loadNews(): void {
    this.newsService
      .listAdminNews({
        q: this.search || undefined,
        statusCode: this.statusFilter === "" ? undefined : this.statusFilter,
        newsKindCode: this.newsTypeFilter === "" ? undefined : (this.newsTypeFilter as "general" | "research" | "event"),
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
      })
      .subscribe((response) => {
        this.items = response.items.map((item) => this.mapNewsItem(item));
        this.total = response.total;
      });
  }

  private mapNewsItem(news: AdminNewsListItem): NewsListItem {
    const publishedAt = parseLocalDate(news.publishedAt);
    const publishedAtLabel = publishedAt
      ? (this.titlecasePipe.transform(this.datePipe.transform(publishedAt, "MMMM dd, y", "es") ?? "") ?? "")
      : "";
    return {
      id: news.id,
      title: news.title,
      publishedAtLabel,
      categoryName: news.categoryName,
      authorName: news.authorName,
      authorAsset: news.authorAsset,
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
    this.categorySearch = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredNewsTypes = this.newsTypes.filter((x) => x.name.toLowerCase().includes(this.categorySearch));
  }

  addCategory(): void {
    this.router.navigate(["dashboard/add-category"]);
  }

  editCategory(id: number): void {
    this.router.navigate(["dashboard/edit-category/" + id]);
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
    this.loadNewsTypes();
    this.loadNews();
  }
}
