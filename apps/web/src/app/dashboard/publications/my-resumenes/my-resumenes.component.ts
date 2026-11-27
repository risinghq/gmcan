import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
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
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
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

@Component({
  selector: "app-my-resumenes",
  templateUrl: "./my-resumenes.component.html",
  styleUrl: "./my-resumenes.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent,
    IconComponent,
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
export default class MyResumenesComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly lookup = inject(LookupService);

  readonly displayedColumns = ["titulo", "primerAutor", "publicacion", "evento"];
  readonly table = new ListTable<PublicationRow>({ search: publicationSearchText, sort: publicationSort });
  private readonly publications = toSignal(
    inject(PublicationService).listPublications({ kindCode: "conference_paper" }),
    {
      initialValue: [],
    },
  );

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

  addResumen(): void {
    this.router.navigate(["dashboard/add-resumen"], { queryParams: { returnTo: "my-abstracts" } });
  }

  editResumen(id: number): void {
    this.router.navigate(["dashboard/edit-resumen/" + id], { queryParams: { returnTo: "my-abstracts" } });
  }
}
