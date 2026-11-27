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
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { EmptyListComponent } from "@app/shared/components/empty-list.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PersonComponent } from "@app/shared/components/person.component";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { RefService, type UniversityItem } from "@app/shared/services/ref.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { ListTable, byName } from "@app/shared/tables/list-table";

import { type PublicationRow, publicationRows, publicationSearchText, publicationSort } from "../publication-row";

@Component({
  selector: "app-tesis",
  templateUrl: "./tesis.component.html",
  styleUrl: "./tesis.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyListComponent,
    PersonComponent,
    MatTabGroup,
    MatTab,
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
export default class TesisComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly lookup = inject(LookupService);
  private readonly tabState = inject(TabStateService);
  private readonly refService = inject(RefService);

  readonly displayedColumns = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  readonly displayedColumns2 = ["nombre"];
  readonly theses = new ListTable<PublicationRow>({ search: publicationSearchText, sort: publicationSort });
  readonly universities = new ListTable<UniversityItem>({ sort: byName });
  selectedTab = this.tabState.thesisTab();
  private readonly publications = toSignal(inject(PublicationService).listPublications({ kindCode: "thesis" }), {
    initialValue: [],
  });

  private readonly thesesSort = viewChild.required("thesesSort", { read: MatSort });
  private readonly thesesPaginator = viewChild.required("thesesPaginator", { read: MatPaginator });
  private readonly universitiesSort = viewChild.required("universitiesSort", { read: MatSort });
  private readonly universitiesPaginator = viewChild.required("universitiesPaginator", { read: MatPaginator });

  constructor() {
    effect(() => this.theses.show(publicationRows(this.publications(), this.lookup)));
    this.refService.listUniversities().subscribe((rows) => this.universities.show(rows));
  }

  ngAfterViewInit(): void {
    this.theses.attach(this.thesesSort(), this.thesesPaginator());
    this.universities.attach(this.universitiesSort(), this.universitiesPaginator());
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
