import { TitleCasePipe, DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
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
import type { Evento } from "@app/shared/models/eventos";
import type { Publicacion } from "@app/shared/models/publicacion";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { SessionService } from "@app/shared/services/session.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

@Component({
  selector: "app-eventos",
  templateUrl: "./eventos.component.html",
  styleUrls: ["./eventos.component.scss"],
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
  eventos: Evento[] = [];
  resumenes: Publicacion[] = [];
  url: string;

  displayedColumns: string[] = ["titulo", "primerAutor", "presentacion", "evento"];
  displayedColumns2: string[] = ["nombre", "pais", "ciudad"];
  dataSource = new MatTableDataSource<Publicacion>([]);
  dataSource2 = new MatTableDataSource<Evento>([]);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator2!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort2!: MatSort;
  selectedTab = 0;

  constructor(
    public _eventosService: EventoService,
    public _router: Router,
    private _publicacionService: PublicacionService,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionAutoresService: PublicacionAutoresService,
    private _session: SessionService,
    private _tabState: TabStateService,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.selectedTab = this._tabState.resumenTab();
    this.getEventos();
    this.getResumenes();
  }

  getResumenes(): void {
    this._publicacionService.getPublicaciones(3).subscribe((res: Publicacion[]) => {
      if (res) {
        res.sort((a: Publicacion, b: Publicacion) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.resumenes = res;
        for (const resumen of this.resumenes) {
          const d = new Date(resumen.fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          resumen.fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
          resumen.fecha = this.titlecasePipe.transform(resumen.fecha) ?? "";
          resumen.autor = [];
          this.getAuthors(resumen);
          this.getSpeEvento(resumen);
        }
        this.dataSource = new MatTableDataSource(this.resumenes);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getSpeEvento(publicacion: Publicacion): void {
    this._eventosService.getEvento(publicacion.evento_idEvento ?? 0).subscribe((res: Evento[]) => {
      if (res[0]) {
        publicacion.evento = res[0].nombre;
      }
    });
  }

  getAuthors(publicacion: Publicacion): void {
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
  }

  getEventos(): void {
    this._eventosService.getEventoesAll().subscribe((res: Evento[]) => {
      if (res) {
        this.eventos = res;
        this.dataSource2 = new MatTableDataSource(this.eventos);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
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
    if (this.dataSource.filteredData.length == 0) {
      this.displayedNotFound = true;
    } else {
      this.displayedNotFound = false;
    }
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    if (this.dataSource2.filteredData.length == 0) {
      this.displayedNotFound2 = true;
    } else {
      this.displayedNotFound2 = false;
    }
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

  editEvento(idEvento: number): void {
    this._router.navigate(["dashboard/edit-evento/" + idEvento]);
  }
}
