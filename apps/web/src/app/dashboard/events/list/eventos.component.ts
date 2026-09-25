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
import type { AdminPublicationListItem } from "@app/shared/models/admin-list";
import type { EventItem } from "@app/shared/services/event.service";
import { EventService } from "@app/shared/services/event.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

@Component({
  selector: "app-eventos",
  templateUrl: "./eventos.component.html",
  styleUrl: "./eventos.component.scss",
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
export default class EventosComponent implements OnInit {
  eventService = inject(EventService);
  router = inject(Router);
  private publicationService = inject(PublicationService);
  private tabState = inject(TabStateService);

  eventos: EventItem[] = [];
  items: AdminPublicationListItem[] = [];

  displayedColumns: string[] = ["titulo", "primerAutor", "presentacion", "evento"];
  displayedColumns2: string[] = ["nombre", "pais", "ciudad"];
  dataSource = new MatTableDataSource<AdminPublicationListItem>([]);
  dataSource2 = new MatTableDataSource<EventItem>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);
  selectedTab = 0;

  ngOnInit(): void {
    this.selectedTab = this.tabState.resumenTab();
    this.getEventos();
    this.getResumenes();
  }

  getResumenes(): void {
    this.publicationService.listAdminPublications({ kindCode: "conference_paper" }).subscribe((rows) => {
      this.items = rows;
      this.dataSource = new MatTableDataSource(this.items);
      this.dataSource.filterPredicate = (row, filter) => {
        const normalized = filter.trim().toLowerCase();
        return (
          row.title.toLowerCase().includes(normalized) ||
          row.firstAuthorName.toLowerCase().includes(normalized) ||
          row.publishedAtLabel.toLowerCase().includes(normalized) ||
          (row.eventName ?? "").toLowerCase().includes(normalized)
        );
      };
      this.dataSource.sort = this.matSort();
      this.dataSource.paginator = this.paginator();
    });
  }

  getEventos(): void {
    this.eventService.listAdmin().subscribe((res: EventItem[]) => {
      if (res) {
        this.eventos = res;
        this.dataSource2 = new MatTableDataSource(this.eventos);
        this.dataSource2.sort = this.sort2();
        this.dataSource2.paginator = this.paginator2();
      }
    });
  }

  displayedNotFound = false;

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.displayedNotFound = this.dataSource.filteredData.length === 0;
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    this.displayedNotFound2 = this.dataSource2.filteredData.length === 0;
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
