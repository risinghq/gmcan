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
import { Router } from "@angular/router";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { AuthService } from "@app/shared/services/auth.service";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";

interface PublicationRow extends PublicPublicationWithAuthors {
  fecha?: string;
  thesisTypeName?: string;
  universityName?: string;
}

@Component({
  selector: "app-my-thesis",
  templateUrl: "./my-thesis.component.html",
  styleUrl: "./my-thesis.component.scss",
  imports: [
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
export default class MyThesisComponent implements OnInit {
  private router = inject(Router);
  lookup = inject(LookupService);
  private publicationService = inject(PublicationService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private auth = inject(AuthService);

  displayedColumns: string[] = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  dataSource: MatTableDataSource<PublicationRow> = new MatTableDataSource<PublicationRow>([]);
  tesis: PublicationRow[] = [];
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  ngOnInit(): void {
    this.getUserThesis();
  }

  getUserThesis(): void {
    const user = this.auth.getUser();
    if (!user) return;
    this.publicationService.listPublications({ kindCode: "thesis" }).subscribe((res) => {
      if (res) {
        const mine = res.filter((pub) => pub.authors.some((a) => a.kind === "registered" && a.memberId === user.id));
        const sorted = mine.toSorted((a, b) =>
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

  addThesis(): void {
    this.router.navigate(["dashboard/add-thesis/"], { queryParams: { returnTo: "my-thesis" } });
  }

  editThesis(id: number): void {
    this.router.navigate(["dashboard/edit-thesis/" + id], { queryParams: { returnTo: "my-thesis" } });
  }
}
