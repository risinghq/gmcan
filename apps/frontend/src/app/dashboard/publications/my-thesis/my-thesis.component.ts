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
import { Router } from "@angular/router";
import { Publicacion } from "@app/shared/models/publicacion";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { TipoTesisService } from "@app/shared/services/tipotesis.service";
import { UniversidadService } from "@app/shared/services/universidad.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";

@Component({
  selector: "app-my-thesis",
  templateUrl: "./my-thesis.component.html",
  styleUrls: ["./my-thesis.component.scss"],
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
export default class MyThesisComponent implements OnInit {
  displayedColumns: string[] = ["titulo", "tipo", "autores", "universidad", "publicacion"];
  dataSource: MatTableDataSource<Publicacion> = new MatTableDataSource<Publicacion>([]);
  tesis: Publicacion[] = [];
  url: string;

  constructor(
    public _router: Router,
    public _revistasService: RevistaService,
    private _publicacionService: PublicacionService,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionAutoresService: PublicacionAutoresService,
    private _usuarioService: UsuarioService,
    public _usuarioHasPermisoService: UsuarioHasPermisoService,
    private _universidadService: UniversidadService,
    private _tipoTesisService: TipoTesisService,
  ) {
    this.url = GLOBAL.url;
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  selectedTab: string | null = null;
  ngOnInit(): void {
    this.getUserArticles();
  }

  getUserArticles(): void {
    const user = this._usuarioService.getUserLogged();
    this.getPermisoHasUsuario(user.DNI ?? "");
    this._publicacionAutoresService.getByUser(user.DNI ?? "").subscribe((res) => {
      if (res) {
        this.tesis = [];
        for (const item of res) {
          this.getThesis(item.publicacion_idPublicacion);
        }
      }
    });
  }

  getThesis(idPublicacion: number): void {
    this._publicacionService.getPublication(idPublicacion).subscribe((res: Publicacion[]) => {
      if (res[0]) {
        if (res[0].tipoPublicacion_idTipoPublicacion === 2) {
          this.tesis.push(res[0]);
          const last = this.tesis[this.tesis.length - 1];
          const d = new Date(last.fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          last.fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
          last.fecha = this.titlecasePipe.transform(last.fecha ?? "");
          last.autor = [];
          this.getAuthors(last);
          this.getTipoThesis(last);
          this.getSpeUniversidad(last);
          this.tesis.sort((a: Publicacion, b: Publicacion) =>
            (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
              ? 1
              : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
                ? -1
                : 0,
          );
        }
        this.dataSource = new MatTableDataSource(this.tesis);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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

  getSpeUniversidad(publicacion: Publicacion): void {
    this._universidadService.getUniversidad(publicacion.universidad_idUniversidad ?? 0).subscribe((res: unknown) => {
      const data = res as { nombre?: string }[];
      if (data) {
        publicacion.universidad = data[0]?.nombre ?? "";
      }
    });
  }

  getAuthors(publicacion: Publicacion): void {
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
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

  publicacionPermiso = false;

  getPermisoHasUsuario(DNI: string): void {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res: { permiso_idPermiso?: number }[]) => {
      if (res.length > 0) {
        for (const permiso of res) {
          if (permiso.permiso_idPermiso === 3) {
            this.publicacionPermiso = true;
          }
        }
      }
    });
  }

  addThesis(): void {
    localStorage.setItem("thesis-back", "my-thesis");
    this._router.navigate(["dashboard/add-thesis/"]);
  }

  editThesis(id: number): void {
    this._publicacionAutoresService.getForPublication(id).subscribe((authors) => {
      const user = this._usuarioService.getUserLogged();
      const isPrincipal = authors.some((a) => a.kind === "registered" && a.DNI === user.DNI && a.isPrincipal === 0);
      if (isPrincipal || this.publicacionPermiso) {
        localStorage.setItem("thesis-back", "my-thesis");
        this._router.navigate(["dashboard/edit-thesis/" + id]);
      }
    });
  }
}
