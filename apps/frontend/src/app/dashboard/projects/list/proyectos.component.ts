import { TitleCasePipe, DatePipe, NgIf, NgFor } from "@angular/common";
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
import { FuenteFinanciamiento } from "@app/shared/models/fuentefinanciamiento";
import { Proyecto } from "@app/shared/models/proyecto";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { GLOBAL } from "@app/shared/services/global";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasProyectoService } from "@app/shared/services/usuariohasproyecto";

@Component({
  selector: "app-proyectos",
  templateUrl: "./proyectos.component.html",
  styleUrls: ["./proyectos.component.scss"],
  imports: [
    NgIf,
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
    NgFor,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
  ],
})
export default class ProyectosComponent implements OnInit {
  displayedColumns: string[] = ["titulo", "primerAutor", "fechaInicio", "codigo"];
  displayedColumns2: string[] = ["nombre"];
  dataSource: MatTableDataSource<Proyecto>;
  dataSource2: MatTableDataSource<FuenteFinanciamiento>;
  fuenteFinanciamientos: Array<FuenteFinanciamiento>;
  proyectos: Array<Proyecto>;
  url;
  selectedTab;

  constructor(
    public _router: Router,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _fuenteFinanciamientoService: FuenteFinanciamientoService,
    public _proyectoService: ProyectoService,
    public _proyectohasusuarioService: UsuarioHasProyectoService,
    public _usuarioService: UsuarioService,
  ) {
    this.url = GLOBAL.url;
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort2: MatSort;

  ejecucion;

  ngOnInit() {
    this.selectedTab = sessionStorage.getItem("oldProject");
    if (window.location.href.includes("ejecucion")) {
      this.ejecucion = true;
      this.getFuenteFinanciamiento();
      this.getProyectos(1);
    } else {
      this.getProyectos(0);
    }
  }

  getFuenteFinanciamiento() {
    this._fuenteFinanciamientoService.getFuenteFinanciamientos().subscribe((res) => {
      if (res) {
        res.sort((a, b) => (a.nombre < b.nombre ? 1 : b.nombre < a.nombre ? -1 : 0));
        this.fuenteFinanciamientos = res;
        this.dataSource2 = new MatTableDataSource(this.fuenteFinanciamientos);
        this.dataSource2.sort = this.sort;
        this.dataSource2.paginator = this.paginator;
      }
    });
  }

  getProyectos(value) {
    this._proyectoService.getProyectos(value).subscribe((res) => {
      if (res) {
        res.sort((a, b) => (a.fechaInicio < b.fechaInicio ? 1 : b.fechaInicio < a.fechaInicio ? -1 : 0));
        this.proyectos = res;
        this.dataSource = new MatTableDataSource(this.proyectos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        for (let index = 0; index < this.proyectos.length; index++) {
          this.fillProyecto(this.proyectos[index]);
        }
      }
    });
  }

  fillProyecto(proyecto) {
    var d = new Date(proyecto.fechaInicio);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    proyecto.fechaI = this.datePipe.transform(d, "MMMM, y", "es");
    proyecto.fechaI = this.titlecasePipe.transform(proyecto.fechaI);
    proyecto.usuario = [];
    this.getProyectoUsuarios(proyecto);
  }

  getProyectoUsuarios(proyecto) {
    this._proyectohasusuarioService.getUsuarioHasProyectos(proyecto.idProyecto).subscribe((res) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          this.getUsuario(proyecto, res[index].usuario_DNI);
        }
      }
    });
  }

  getUsuario(proyecto, DNI) {
    this._usuarioService.getUser(DNI).subscribe((res) => {
      if (res) {
        proyecto.usuario.push(res[0]);
        proyecto.usuario[proyecto.usuario.length - 1].nombreCompleto =
          proyecto.usuario[proyecto.usuario.length - 1].nombre +
          " " +
          proyecto.usuario[proyecto.usuario.length - 1].apellidoPaterno +
          " " +
          proyecto.usuario[proyecto.usuario.length - 1].apellidoMaterno;
      }
    });
  }

  displayedNotFound;

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

  displayedNotFound2;

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

  displayedNotFound3;

  applyFilter3(event: Event) {
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

  changedTab(event) {
    sessionStorage.setItem("oldProject", event);
  }

  addProject() {
    this._router.navigate(["dashboard/add-project"]);
  }

  editProject(id) {
    this._router.navigate(["dashboard/edit-project/" + id]);
  }

  addFuente() {
    this._router.navigate(["dashboard/add-fuente"]);
  }

  editFuente(id) {
    this._router.navigate(["dashboard/edit-fuente/" + id]);
  }
}
