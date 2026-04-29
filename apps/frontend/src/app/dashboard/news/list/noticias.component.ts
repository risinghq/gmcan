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
import { ActivatedRoute, Router } from "@angular/router";
import type { News } from "@app/shared/models/news";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NewsService } from "@app/shared/services/news.service";
import type { RefItem } from "@app/shared/services/ref.service";
import { RefService } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

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
  private _newsService = inject(NewsService);
  private _refService = inject(RefService);
  lookup = inject(LookupService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _tabState = inject(TabStateService);

  displayedColumns: string[] = ["title", "publishedAtDisplay", "newsTypeName", "statusText"];
  displayedColumns2: string[] = ["name"];
  dataSource = new MatTableDataSource<NewsRow>([]);
  dataSource2 = new MatTableDataSource<RefItem>([]);
  selectedTab = 0;

  url: string;
  public noticias: NewsRow[] = [];
  public newsTypes: RefItem[] = [];

  ngOnInit(): void {
    this.selectedTab = this._tabState.newsTab();
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
    this._refService.listNewsTypes().subscribe((types) => {
      this.newsTypes = types;
      this.dataSource2 = new MatTableDataSource(this.newsTypes);
      this.dataSource2.sort = this.sort2();
      this.dataSource2.paginator = this.paginator2();
    });
  }

  getNews(): void {
    this._newsService.listAdminNews().subscribe((res: News[]) => {
      if (res != null) {
        const sorted = res.toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.noticias = sorted.map((n) => {
          const row: NewsRow = Object.assign({} as NewsRow, n);
          const cat = this.newsTypes.find((t) => t.id === n.newsTypeId);
          row.newsTypeName = cat?.name ?? "";
          row.statusText = n.status === 1 ? "Activo" : "Inactivo";
          if (n.publishedAt) {
            const d = new Date(n.publishedAt);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            row.publishedAtDisplay = this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM dd, y", "es") ?? "");
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
  }

  addCategory(): void {
    this._router.navigate(["dashboard/add-category"]);
  }

  editCategory(id: number): void {
    this._router.navigate(["dashboard/edit-category/" + id]);
  }

  addNews(): void {
    this._router.navigate(["dashboard/add-news"]);
  }

  editNews(id: number): void {
    this._router.navigate(["dashboard/edit-news/" + id]);
  }

  changedTab(event: number): void {
    this._tabState.newsTab.set(event);
  }
}
