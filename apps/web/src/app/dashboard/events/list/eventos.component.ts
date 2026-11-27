import { type AfterViewInit, ChangeDetectionStrategy, Component, inject, viewChild } from "@angular/core";
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
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { PersonComponent } from "@app/shared/components/person.component";
import type { AdminPublicationListItem } from "@app/shared/models/admin-list";
import type { EventItem } from "@app/shared/services/event.service";
import { EventService } from "@app/shared/services/event.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { ListTable, byName } from "@app/shared/tables/list-table";

@Component({
  selector: "app-eventos",
  templateUrl: "./eventos.component.html",
  styleUrl: "./eventos.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
export default class EventosComponent implements AfterViewInit {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly publicationService = inject(PublicationService);
  private readonly tabState = inject(TabStateService);

  readonly displayedColumns = ["titulo", "primerAutor", "presentacion", "evento"];
  readonly displayedColumns2 = ["nombre", "pais", "ciudad"];
  readonly abstracts = new ListTable<AdminPublicationListItem>({
    search: (row) => [row.title, row.firstAuthorName, row.publishedAtLabel, row.eventName],
    sort: {
      titulo: (row) => row.title,
      primerAutor: (row) => row.firstAuthorName,
      presentacion: (row) => row.publishedAt,
      evento: (row) => row.eventName,
    },
  });
  readonly events = new ListTable<EventItem>({
    sort: { ...byName, pais: (row) => row.country ?? "", ciudad: (row) => row.city ?? "" },
  });
  selectedTab = this.tabState.resumenTab();

  private readonly abstractsSort = viewChild.required("abstractsSort", { read: MatSort });
  private readonly abstractsPaginator = viewChild.required("abstractsPaginator", { read: MatPaginator });
  private readonly eventsSort = viewChild.required("eventsSort", { read: MatSort });
  private readonly eventsPaginator = viewChild.required("eventsPaginator", { read: MatPaginator });

  constructor() {
    this.publicationService
      .listAdminPublications({ kindCode: "conference_paper" })
      .subscribe((rows) => this.abstracts.show(rows));
    this.eventService.listAdmin().subscribe((rows) => this.events.show(rows));
  }

  ngAfterViewInit(): void {
    this.abstracts.attach(this.abstractsSort(), this.abstractsPaginator());
    this.events.attach(this.eventsSort(), this.eventsPaginator());
  }

  changedTab(event: number): void {
    this.tabState.resumenTab.set(event);
  }

  addResumen(): void {
    this.router.navigate(["dashboard/add-resumen"], { queryParams: { returnTo: "eventos" } });
  }

  editResumen(id: number): void {
    this.router.navigate(["dashboard/edit-resumen/" + id], { queryParams: { returnTo: "eventos" } });
  }

  addEvento(): void {
    this.router.navigate(["dashboard/add-evento"]);
  }

  editEvento(id: number): void {
    this.router.navigate(["dashboard/edit-evento/" + id]);
  }
}
