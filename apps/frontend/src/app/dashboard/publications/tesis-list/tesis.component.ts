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
import type { PublicationWithAuthors } from "@app/shared/models/publication";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import type { UniversityItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

interface PublicationRow extends PublicationWithAuthors {
  fecha?: string;
  thesisTypeName?: string;
  universityName?: string;
}

@Component({
  selector: "app-tesis",
  templateUrl: "./tesis.component.html",
  styleUrl: "./tesis.component.scss",
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
export default class TesisComponent implements OnInit {
  router = inject(Router);
  lookup = inject(LookupService);
  private publicationService = inject(PublicationService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  displayedColumns2: string[] = ["nombre"];
  dataSource: MatTableDataSource<PublicationRow> = new MatTableDataSource<PublicationRow>([]);
  dataSource2: MatTableDataSource<UniversityItem> = new MatTableDataSource<UniversityItem>([]);
  tesis: PublicationRow[] = [];
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
    this.selectedTab = this.tabState.thesisTab();
    const universities = this.lookup.universities();
    this.dataSource2 = new MatTableDataSource(universities);
    this.dataSource2.sort = this.sort2();
    this.dataSource2.paginator = this.paginator2();
    this.getThesis();
  }

  getThesis(): void {
    this.publicationService.listPublications({ type: 2 }).subscribe((res) => {
      if (res) {
        const sorted = res.toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.tesis = sorted.map((pub) => {
          const row: PublicationRow = Object.assign({} as PublicationRow, pub);
          const d = new Date(pub.publishedAt);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          row.fecha = this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM, y", "es") ?? "");
          const thesisType = this.lookup.thesisTypes().find((t) => t.id === pub.thesisTypeId);
          row.thesisTypeName = thesisType?.name ?? "";
          const university = this.lookup.universities().find((u) => u.id === pub.universityId);
          row.universityName = university?.name ?? "";
          return row;
        });
        this.dataSource = new MatTableDataSource(this.tesis);
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
    this.tabState.thesisTab.set(event);
  }

  addThesis(): void {
    localStorage.setItem("thesis-back", "tesis");
    this.router.navigate(["dashboard/add-thesis"]);
  }

  editThesis(id: number): void {
    localStorage.setItem("thesis-back", "tesis");
    this.router.navigate(["dashboard/edit-thesis/" + id]);
  }

  addUniversidad(): void {
    this.router.navigate(["dashboard/add-universidad"]);
  }

  editUniversidad(id: number): void {
    this.router.navigate(["dashboard/edit-universidad/" + id]);
  }
}
