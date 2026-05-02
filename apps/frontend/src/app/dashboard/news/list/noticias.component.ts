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
import type { News } from "@app/shared/models/news";
import { GLOBAL } from "@app/shared/services/global";
import { NewsService } from "@app/shared/services/news.service";
import type { RefItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { parseLocalDate } from "@app/shared/utils/date";

interface NewsRow extends News {
  publishedAtDisplay?: string;
  newsTypeName?: string;
  statusText?: string;
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
  private readonly refService = inject(RefService);
  private readonly titlecasePipe = inject(TitleCasePipe);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private readonly tabState = inject(TabStateService);

  displayedColumns: string[] = ["title", "publishedAtDisplay", "newsTypeName", "statusText"];
  displayedColumns2: string[] = ["name"];
  dataSource = new MatTableDataSource<NewsRow>([]);
  dataSource2 = new MatTableDataSource<RefItem>([]);
  selectedTab = 0;

  url: string;
  public noticias: NewsRow[] = [];
  public newsTypes: RefItem[] = [];

  ngOnInit(): void {
    this.selectedTab = this.tabState.newsTab();
    this.loadNewsTypes();
    this.getNews();
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  constructor() {
    this.url = GLOBAL.url;
  }

  loadNewsTypes(): void {
    this.refService.listNewsTypes().subscribe((types) => {
      this.newsTypes = types;
      this.dataSource2 = new MatTableDataSource(this.newsTypes);
      this.dataSource2.sort = this.sort2();
      this.dataSource2.paginator = this.paginator2();
    });
  }

  getNews(): void {
    this.newsService.listAdminNews().subscribe((res: News[]) => {
      if (res != null) {
        const sorted = res.toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.noticias = sorted.map((n) => {
          const row: NewsRow = Object.assign({} as NewsRow, n);
          const cat = this.newsTypes.find((t) => t.id === n.newsTypeId);
          row.newsTypeName = cat?.name ?? "";
          row.statusText = n.status === 1 ? "Activo" : "Inactivo";
          const publishedAt = parseLocalDate(n.publishedAt);
          if (publishedAt) {
            row.publishedAtDisplay =
              this.titlecasePipe.transform(this.datePipe.transform(publishedAt, "MMMM dd, y", "es") ?? "") ?? "";
          }
          return row;
        });
        this.dataSource = new MatTableDataSource(this.noticias);
        this.dataSource.paginator = this.paginator();
        this.dataSource.sort = this.matSort();
      }
    });
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

  private applyFilterToSource<T>(event: Event, dataSource: MatTableDataSource<T>): boolean {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;
    dataSource.paginator?.firstPage();
    return dataSource.filteredData.length === 0;
  }
}
