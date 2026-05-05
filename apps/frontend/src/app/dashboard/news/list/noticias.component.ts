import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, viewChild } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {
  MatTableDataSource,
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
import type { Member } from "@app/shared/models/member";
import type { News } from "@app/shared/models/news";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import type { RefItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { parseLocalDate } from "@app/shared/utils/date";
import { forkJoin } from "rxjs";

interface NewsListItem {
  id: number;
  title: string;
  publishedAtLabel: string;
  categoryName: string;
  authorName: string;
  authorAsset: string | null;
  status: number;
  statusLabel: string;
}

@Component({
  selector: "app-noticias",
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
export default class NoticiasComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly memberService = inject(MemberService);
  private readonly refService = inject(RefService);
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private readonly tabState = inject(TabStateService);

  displayedColumns: string[] = ["title", "publishedAtLabel", "categoryName", "authorName", "status"];
  displayedColumns2: string[] = ["name"];
  dataSource = new MatTableDataSource<NewsListItem>([]);
  dataSource2 = new MatTableDataSource<RefItem>([]);
  selectedTab = 0;
  items: NewsListItem[] = [];
  newsTypes: RefItem[] = [];

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);
  constructor() {}

  private loadList(): void {
    forkJoin({
      news: this.newsService.listAdminNews(),
      authors: this.memberService.listAdminMembers(),
      newsTypes: this.refService.listNewsTypes(),
    }).subscribe(({ news, authors, newsTypes }: { news: News[]; authors: Member[]; newsTypes: RefItem[] }) => {
      const membersById = new Map<number, Member>(authors.map((member) => [member.id, member]));
      const newsTypesById = new Map<number, RefItem>(newsTypes.map((newsType) => [newsType.id, newsType]));
      this.newsTypes = newsTypes;
      this.dataSource2 = new MatTableDataSource(this.newsTypes);
      this.dataSource2.sort = this.sort2();
      this.dataSource2.paginator = this.paginator2();

      this.items = news
        .toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        )
        .map((item) => this.mapNewsItem(item, membersById, newsTypesById));

      this.dataSource = new MatTableDataSource(this.items);
      this.dataSource.filterPredicate = (row, filter) => {
        const normalized = filter.trim().toLowerCase();
        return (
          row.title.toLowerCase().includes(normalized) ||
          row.publishedAtLabel.toLowerCase().includes(normalized) ||
          row.categoryName.toLowerCase().includes(normalized) ||
          row.authorName.toLowerCase().includes(normalized) ||
          row.statusLabel.toLowerCase().includes(normalized)
        );
      };
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.matSort();
    });
  }

  private mapNewsItem(news: News, membersById: Map<number, Member>, newsTypesById: Map<number, RefItem>): NewsListItem {
    const author = membersById.get(news.authorId);
    const category = newsTypesById.get(news.newsTypeId);
    const publishedAt = parseLocalDate(news.publishedAt);
    const publishedAtLabel = publishedAt
      ? (this.titlecasePipe.transform(this.datePipe.transform(publishedAt, "MMMM dd, y", "es") ?? "") ?? "")
      : "";
    return {
      id: news.id,
      title: news.title,
      publishedAtLabel,
      categoryName: category?.name ?? "",
      authorName: author ? [author.firstName, author.lastName, author.maternalName].filter(Boolean).join(" ") : "",
      authorAsset: author?.asset ?? null,
      status: news.status,
      statusLabel: news.status === 1 ? "Activo" : "Inactivo",
    };
  }

  displayedNotFound = false;
  displayedNotFound2 = false;

  applyFilter(event: Event): void {
    this.displayedNotFound = this.applyFilterToSource(event, this.dataSource);
  }

  applyFilter2(event: Event): void {
    this.displayedNotFound2 = this.applyFilterToSource(event, this.dataSource2);
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
    this.loadList();
  }

  private applyFilterToSource<T>(event: Event, dataSource: MatTableDataSource<T>): boolean {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;
    dataSource.paginator?.firstPage();
    return dataSource.filteredData.length === 0;
  }
}
