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
import type { EventItem } from "@app/shared/services/event.service";
import { EventService } from "@app/shared/services/event.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicationService } from "@app/shared/services/publication.service";
import { SessionService } from "@app/shared/services/session.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

@Component({
  selector: "app-eventos",
  templateUrl: "./eventos.component.html",
  styleUrl: "./eventos.component.scss",
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
  _eventService = inject(EventService);
  _router = inject(Router);
  private _publicationService = inject(PublicationService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private _session = inject(SessionService);
  private _tabState = inject(TabStateService);

  eventos: EventItem[] = [];
  resumenes: PublicationWithAuthors[] = [];
  url: string;

  displayedColumns: string[] = ["titulo", "primerAutor", "presentacion", "evento"];
  displayedColumns2: string[] = ["nombre", "pais", "ciudad"];
  dataSource = new MatTableDataSource<PublicationWithAuthors>([]);
  dataSource2 = new MatTableDataSource<EventItem>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);
  selectedTab = 0;

  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.selectedTab = this._tabState.resumenTab();
    this.getEventos();
    this.getResumenes();
  }

  getResumenes(): void {
    this._publicationService.listPublications({ type: 3 }).subscribe((res: PublicationWithAuthors[]) => {
      if (res) {
        res.sort((a, b) =>
          (a.publishedAt ?? "") < (b.publishedAt ?? "") ? 1 : (b.publishedAt ?? "") < (a.publishedAt ?? "") ? -1 : 0,
        );
        this.resumenes = res.map((pub) => {
          const d = new Date(pub.publishedAt ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          return {
            ...pub,
            fecha: this.titlecasePipe.transform(this.datePipe.transform(d, "MMMM, y", "es") ?? ""),
          };
        });
        this.dataSource = new MatTableDataSource(this.resumenes);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();
      }
    });
  }

  getEventos(): void {
    this._eventService.listAdmin().subscribe((res: EventItem[]) => {
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
    this._tabState.resumenTab.set(event);
  }

  addResumen(): void {
    this._session.setResumenBack("eventos");
    this._router.navigate(["dashboard/add-resumen"]);
  }

  editResumen(id: number): void {
    this._session.setResumenBack("eventos");
    this._router.navigate(["dashboard/edit-resumen/" + id]);
  }

  addEvento(): void {
    this._router.navigate(["dashboard/add-evento"]);
  }

  editEvento(id: number): void {
    this._router.navigate(["dashboard/edit-evento/" + id]);
  }
}
