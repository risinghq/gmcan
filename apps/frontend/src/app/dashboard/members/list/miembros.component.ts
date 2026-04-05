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
import { Router } from "@angular/router";
import { UsuarioFull } from "@app/shared/models/usuarioFull";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-miembros",
  templateUrl: "./miembros.component.html",
  styleUrl: "./miembros.component.scss",
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
export default class MiembrosComponent implements OnInit {
  _usuarioService = inject(UsuarioService);
  lookup = inject(LookupService);
  _router = inject(Router);

  displayedColumns: string[] = ["nombre", "apellidoPaterno", "apellidoMaterno", "grado", "cargo", "correo"];
  miembros: UsuarioFull[] = [];
  dataSource = new MatTableDataSource<UsuarioFull>([]);
  url: string;
  constructor() {
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.obtainingValue();
  }
  canAdd = false;
  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  obtainingValue(): void {
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

  getMiembrosActivos(value: number): void {
    this._usuarioService.getUsersActive(String(value)).subscribe((res: UsuarioFull[]) => {
      if (res.length > 0) {
        res.sort((a: UsuarioFull, b: UsuarioFull) =>
          (a.apellidoPaterno ?? "") < (b.apellidoPaterno ?? "")
            ? 1
            : (b.apellidoPaterno ?? "") < (a.apellidoPaterno ?? "")
              ? -1
              : 0,
        );
        for (let index = 0; index < res.length; index++) {
          this.miembros.push(res[index]);
        }
        this.dataSource = new MatTableDataSource(this.miembros);
        this.dataSource.paginator = this.paginator();
        this.dataSource.sort = this.matSort();
        for (let index = 0; index < this.miembros.length; index++) {
          this.getCargo(this.miembros[index]);
          this.getGrado(this.miembros[index]);
        }
      }
    });
  }

  getCargo(miembro: UsuarioFull): void {
    const found = this.lookup.tiposMiembro().find((t) => t.idTipoMiembro === miembro.tipoMiembro_idTipoMiembro);
    if (found) miembro.tipoMiembro = found.nombreSingular;
  }

  getGrado(miembro: UsuarioFull): void {
    const found = this.lookup.prefijos().find((p) => p.idPrefijo === miembro.prefijo_idPrefijo);
    if (found) miembro.prefijo = found.nombre;
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

  addMember(): void {
    this._router.navigate(["dashboard/add-member"]);
  }

  editMember(id: string): void {
    const user = this._usuarioService.getUserLogged();
    if (user.DNI == id) {
      this._router.navigate(["dashboard/perfil"]);
    } else {
      this._router.navigate(["dashboard/edit-member/" + id]);
    }
  }
}
