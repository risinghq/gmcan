import { NgIf } from "@angular/common";
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
import { Router } from "@angular/router";

import { UsuarioFull } from "../models/usuarioFull";
import { GLOBAL } from "../services/global";
import { PrefijoService } from "../services/prefijo.service";
import { TipoMiembroService } from "../services/tipomiembro.service";
import { UsuarioService } from "../services/usuario.service";

@Component({
  selector: "app-miembros",
  templateUrl: "./miembros.component.html",
  styleUrls: ["./miembros.component.scss"],
  imports: [
    MatIcon,
    NgIf,
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
export class MiembrosComponent implements OnInit {
  displayedColumns: string[] = ["nombre", "apellidoPaterno", "apellidoMaterno", "grado", "cargo", "correo"];
  miembros: Array<UsuarioFull>;
  dataSource: MatTableDataSource<UsuarioFull>;
  url;
  constructor(
    public _usuarioService: UsuarioService,
    public _tipoMiembroService: TipoMiembroService,
    public _prefijoService: PrefijoService,
    public _router: Router,
  ) {
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.miembros = [];
    this.obtainingValue();
  }
  canAdd;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  obtainingValue() {
    if (window.location.href.includes("activos")) {
      localStorage.setItem("active-member", "1");
      this.getMiembrosActivos(1);
      this.canAdd = true;
    } else {
      localStorage.setItem("active-member", "0");
      this.getMiembrosActivos(0);
      this.getMiembrosActivos(3);
      this.canAdd = false;
    }
  }

  getMiembrosActivos(value) {
    this._usuarioService.getUsersActive(value).subscribe((res) => {
      if (res.length > 0) {
        res.sort((a, b) =>
          a.apellidoPaterno < b.apellidoPaterno ? 1 : b.apellidoPaterno < a.apellidoPaterno ? -1 : 0,
        );
        for (let index = 0; index < res.length; index++) {
          this.miembros.push(res[index]);
        }
        this.dataSource = new MatTableDataSource(this.miembros);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        for (let index = 0; index < this.miembros.length; index++) {
          this.getCargo(this.miembros[index]);
          this.getGrado(this.miembros[index]);
        }
      }
    });
  }

  getCargo(miembro) {
    this._tipoMiembroService.getTipoMiembros().subscribe((res) => {
      if (res) {
        let index = res.findIndex((x) => x.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
        if (index != -1) {
          miembro.tipoMiembro = res[index].nombreSingular;
        }
      }
    });
  }

  getGrado(miembro) {
    this._prefijoService.getPrefijos().subscribe((res) => {
      if (res) {
        let index = res.findIndex((x) => x.idPrefijo === miembro.prefijo_idPrefijo);
        if (index != -1) {
          miembro.prefijo = res[index].nombre;
        }
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

  addMember() {
    this._router.navigate(["dashboard/add-member"]);
  }

  editMember(id) {
    let user = this._usuarioService.getUserLogged();
    if (user.DNI == id) {
      this._router.navigate(["dashboard/perfil"]);
    } else {
      this._router.navigate(["dashboard/edit-member/" + id]);
    }
  }
}
