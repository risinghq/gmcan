import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, viewChild, ChangeDetectionStrategy } from "@angular/core";
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
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { RefService, type UniversityItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

interface PublicationRow extends PublicPublicationWithAuthors {
  fecha?: string;
  thesisTypeName?: string;
  universityName?: string;
}

@Component({
  selector: "app-tesis",
  templateUrl: "./tesis.component.html",
  styleUrl: "./tesis.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
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
  private refService = inject(RefService);
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
    this.refService.listUniversities().subscribe((universities) => {
      this.dataSource2 = new MatTableDataSource(universities);
      this.dataSource2.sort = this.sort2();
      this.dataSource2.paginator = this.paginator2();
    });
    this.getThesis();
  }

  getThesis(): void {
    this.publicationService.listPublications({ kindCode: "thesis" }).subscribe((res) => {
      if (res) {
        const sorted = res.toSorted((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.tesis = sorted.map((pub) => {
          const row: PublicationRow = Object.assign({} as PublicationRow, pub);
          const d = new Date(pub.publishedAt);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          row.fecha = this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM, y", "es") ?? "");
          const thesisKindCode = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.thesisKindCode : null;
          const universityId = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.universityId : null;
          const thesisType = this.lookup.thesisKinds().find((t) => t.code === thesisKindCode);
          row.thesisTypeName = thesisType?.name ?? "";
          const university = this.lookup.universities().find((u) => u.id === universityId);
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
    this.router.navigate(["dashboard/add-thesis"], { queryParams: { returnTo: "tesis" } });
  }

  editThesis(id: number): void {
    this.router.navigate(["dashboard/edit-thesis/" + id], { queryParams: { returnTo: "tesis" } });
  }

  addUniversidad(): void {
    this.router.navigate(["dashboard/add-universidad"]);
  }

  editUniversidad(id: number): void {
    this.router.navigate(["dashboard/edit-universidad/" + id]);
  }
}
