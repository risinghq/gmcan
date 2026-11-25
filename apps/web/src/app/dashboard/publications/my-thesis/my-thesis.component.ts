import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIcon } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
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
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { ListTable } from "@app/shared/tables/list-table";

import {
  type PublicationRow,
  authoredBy,
  publicationRows,
  publicationSearchText,
  publicationSort,
} from "../publication-row";

/** The theses the signed-in member authored. */
@Component({
  selector: "app-my-thesis",
  templateUrl: "./my-thesis.component.html",
  styleUrl: "./my-thesis.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export default class MyThesisComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly lookup = inject(LookupService);

  readonly displayedColumns = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  readonly table = new ListTable<PublicationRow>({ search: publicationSearchText, sort: publicationSort });
  private readonly publications = toSignal(inject(PublicationService).listPublications({ kindCode: "thesis" }), {
    initialValue: [],
  });

  private readonly paginator = viewChild.required(MatPaginator);
  private readonly matSort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      this.table.show(user ? publicationRows(authoredBy(this.publications(), user.id), this.lookup) : []);
    });
  }

  ngAfterViewInit(): void {
    this.table.attach(this.matSort(), this.paginator());
  }

  addThesis(): void {
    this.router.navigate(["dashboard/add-thesis"], { queryParams: { returnTo: "my-thesis" } });
  }

  editThesis(id: number): void {
    this.router.navigate(["dashboard/edit-thesis/" + id], { queryParams: { returnTo: "my-thesis" } });
  }
}
