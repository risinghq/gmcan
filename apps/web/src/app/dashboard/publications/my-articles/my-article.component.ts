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
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicationService } from "@app/shared/services/publication.service";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

interface PublicationRow extends PublicPublicationWithAuthors {
  fecha?: string;
}

@Component({
  selector: "app-my-article",
  templateUrl: "./my-article.component.html",
  styleUrl: "./my-article.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
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
export default class MyArticleComponent implements OnInit {
  private router = inject(Router);
  private publicationService = inject(PublicationService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private auth = inject(AuthService);

  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "DOI"];
  dataSource: MatTableDataSource<PublicationRow> = new MatTableDataSource<PublicationRow>([]);

  articulos: PublicationRow[] = [];
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  ngOnInit(): void {
    this.getUserArticles();
  }

  getUserArticles(): void {
    const user = this.auth.getUser();
    if (!user) return;
    this.publicationService.listPublications({ kindCode: "journal_article" }).subscribe((res) => {
      if (res) {
        const mine = res.filter((pub) => pub.authors.some((a) => a.kind === "registered" && a.memberId === user.id));
        const sorted = mine.toSorted((a, b) =>
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

  addArticle(): void {
    this.router.navigate(["dashboard/add-article/"], { queryParams: { returnTo: "my-articles" } });
  }

  editArticulo(id: number): void {
    this.router.navigate(["dashboard/edit-article/" + id], { queryParams: { returnTo: "my-articles" } });
  }
}
