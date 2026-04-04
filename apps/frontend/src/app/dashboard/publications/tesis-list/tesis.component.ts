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
import { Publicacion } from "@app/shared/models/publicacion";
import { Universidad } from "@app/shared/models/universidad";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { TipoTesisService } from "@app/shared/services/tipotesis.service";
import { UniversidadService } from "@app/shared/services/universidad.service";

@Component({
  selector: "app-tesis",
  templateUrl: "./tesis.component.html",
  styleUrl: "./tesis.component.scss",
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
  _router = inject(Router);
  _universidadService = inject(UniversidadService);
  private _publicacionService = inject(PublicacionService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private _publicacionAutoresService = inject(PublicacionAutoresService);
  private _tipoTesisService = inject(TipoTesisService);
  private _tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  displayedColumns2: string[] = ["nombre"];
  dataSource: MatTableDataSource<Publicacion> = new MatTableDataSource<Publicacion>([]);
  dataSource2: MatTableDataSource<Universidad> = new MatTableDataSource<Universidad>([]);
  tesis: Publicacion[] = [];
  url: string;

  universidades: Universidad[] = [];

  constructor() {
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  selectedTab = 0;

  ngOnInit(): void {
    this.selectedTab = this._tabState.thesisTab();
    this.getUniversidad();
    this.getThesis();
  }

  getThesis(): void {
    this._publicacionService.getPublicaciones(2).subscribe((res: Publicacion[]) => {
      if (res) {
        res.sort((a: Publicacion, b: Publicacion) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.tesis = res;
        for (let index = 0; index < this.tesis.length; index++) {
          const d = new Date(this.tesis[index].fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.tesis[index].fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
          this.tesis[index].fecha = this.titlecasePipe.transform(this.tesis[index].fecha ?? "");
          this.tesis[index].autor = [];
          this.getThesisAuthors(this.tesis[index]);
          this.getTipoThesis(this.tesis[index]);
          this.getSpeUniversidad(this.tesis[index]);
        }
        this.dataSource = new MatTableDataSource(this.tesis);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();
      }
    });
  }

  getTipoThesis(publicacion: Publicacion): void {
    this._tipoTesisService.getTipoTesis(publicacion.tipoTesis_idTipoTesis ?? 0).subscribe((res: unknown) => {
      const data = res as { nombre?: string }[];
      if (data) {
        publicacion.tipoTesis = data[0]?.nombre ?? "";
      }
    });
  }

  getThesisAuthors(publicacion: Publicacion): void {
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
  }

  getSpeUniversidad(publicacion: Publicacion): void {
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: unknown) => {
      const data = res as { nombre?: string }[];
      if (data) {
        publicacion.universidad = data[0]?.nombre ?? "";
      }
    });
  }

  getUniversidad(): void {
    this._universidadService.getUniversidades().subscribe((res: Universidad[]) => {
      if (res) {
        this.universidades = res;
        this.dataSource2 = new MatTableDataSource(this.universidades);
        this.dataSource2.sort = this.sort2();
        this.dataSource2.paginator = this.paginator2();
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
    if (this.dataSource.filteredData.length == 0) {
      this.displayedNotFound = true;
    } else {
      this.displayedNotFound = false;
    }
  }

  displayedNotFound2 = false;

  applyFilter2(event: Event) {
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
    this._tabState.thesisTab.set(event);
  }

  addThesis(): void {
    localStorage.setItem("thesis-back", "tesis");
    this._router.navigate(["dashboard/add-thesis"]);
  }

  editThesis(id: number): void {
    localStorage.setItem("thesis-back", "tesis");
    this._router.navigate(["dashboard/edit-thesis/" + id]);
  }

  addUniversidad(): void {
    this._router.navigate(["dashboard/add-universidad"]);
  }

  editUniversidad(idUniversidad: number): void {
    this._router.navigate(["dashboard/edit-universidad/" + idUniversidad]);
  }
}
