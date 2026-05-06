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
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import type { JournalItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

interface PublicationRow extends PublicPublicationWithAuthors {
  fecha?: string;
}

@Component({
  selector: "app-articulos",
  templateUrl: "./articulos.component.html",
  styleUrl: "./articulos.component.scss",
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
export default class ArticulosComponent implements OnInit {
  router = inject(Router);
  lookup = inject(LookupService);
  private publicationService = inject(PublicationService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "DOI"];
  displayedColumns2: string[] = ["nombre"];
  dataSource = new MatTableDataSource<PublicationRow>([]);
  dataSource2 = new MatTableDataSource<JournalItem>([]);

  articulos: PublicationRow[] = [];
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  selectedTab = 0;
  ngOnInit(): void {
    this.selectedTab = this.tabState.articleTab();
    const journals = this.lookup.journals();
    this.dataSource2 = new MatTableDataSource(journals);
    this.dataSource2.sort = this.sort2();
    this.dataSource2.paginator = this.paginator2();
    this.getArticles();
  }

  getArticles(): void {
    this.publicationService.listPublications({ kindCode: "journal_article" }).subscribe((res) => {
      if (res) {
        const sorted = res.toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.articulos = sorted.map((pub) => {
          const row: PublicationRow = Object.assign({} as PublicationRow, pub);
          const d = new Date(pub.publishedAt);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          row.fecha = this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM, y", "es") ?? "");
          return row;
        });
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();
      }
    });
  }

  displayedNotFound = false;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
  }

  changedTab(event: number): void {
    this.tabState.articleTab.set(event);
  }

  addRevista() {
    this.router.navigate(["dashboard/add-revista"]);
  }

  editRevista(id: number): void {
    this.router.navigate(["dashboard/edit-revista/" + id]);
  }

  addArticle() {
    this.router.navigate(["dashboard/add-article/"], { queryParams: { returnTo: "articulos" } });
  }

  editArticulo(id: number): void {
    this.router.navigate(["dashboard/edit-article/" + id], { queryParams: { returnTo: "articulos" } });
  }
}
