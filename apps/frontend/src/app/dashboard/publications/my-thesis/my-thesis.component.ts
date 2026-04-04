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
import { Router } from "@angular/router";
import { Publicacion } from "@app/shared/models/publicacion";
import { AutorService } from "@app/shared/services/autor.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
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
    NgIf,
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
    private _publicacionhasusuarioService: PublicacionHasUsuarioService,
    private _publicacionhasautorService: PublicacionHasAutorService,
    private _usuarioService: UsuarioService,
    private _autorService: AutorService,
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
    let user = this._usuarioService.getUserLogged();
    this.getPermisoHasUsuario(user.DNI ?? "");
    this._publicacionhasusuarioService
      .searchPublicacionHasUsuario(user.DNI ?? "")
      .subscribe((res: { publicacion_idPublicacion?: number }[]) => {
        if (res) {
          this.tesis = [];
          for (let index = 0; index < res.length; index++) {
            this.getThesis(res[index].publicacion_idPublicacion ?? 0);
          }
        }
      });
  }

  getThesis(idPublicacion: number): void {
    this._publicacionService.getPublication(idPublicacion).subscribe((res: Publicacion[]) => {
      if (res[0]) {
        if (res[0].tipoPublicacion_idTipoPublicacion === 2) {
          this.tesis.push(res[0]);
          const d = new Date(this.tesis[this.tesis.length - 1].fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.tesis[this.tesis.length - 1].fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
          this.tesis[this.tesis.length - 1].fecha = this.titlecasePipe.transform(
            this.tesis[this.tesis.length - 1].fecha ?? "",
          );
          this.tesis[this.tesis.length - 1].usuario = [];
          this.tesis[this.tesis.length - 1].autor = [];
          this.getThesisUsers(this.tesis[this.tesis.length - 1]);
          this.getThesisAuthors(this.tesis[this.tesis.length - 1]);
          this.getTipoThesis(this.tesis[this.tesis.length - 1]);
          this.getSpeUniversidad(this.tesis[this.tesis.length - 1]);
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

  getThesisUsers(publicacion: Publicacion): void {
    this._publicacionhasusuarioService
      .getPublicacionHasUsuario(publicacion.idPublicacion ?? 0)
      .subscribe((res: { usuario_DNI?: string }[]) => {
        if (res) {
          for (let index = 0; index < res.length; index++) {
            this.getUsuario(res[index].usuario_DNI ?? "", publicacion);
          }
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

  getUsuario(idUser: string, publicacion: Publicacion): void {
    this._usuarioService
      .getUser(idUser)
      .subscribe((res: { nombre?: string; apellidoPaterno?: string; apellidoMaterno?: string }[]) => {
        if (res[0] != undefined) {
          const usuario = {
            ...res[0],
            nombreCompleto:
              `${res[0].nombre ?? ""} ${res[0].apellidoPaterno ?? ""} ${res[0].apellidoMaterno ?? ""}`.trim(),
          };
          publicacion.usuario?.push(usuario);
        }
      });
  }

  getThesisAuthors(publicacion: Publicacion): void {
    this._publicacionhasautorService
      .getPublicacionHasAutor(publicacion.idPublicacion ?? 0)
      .subscribe((res: { autores_idAutor?: number }[]) => {
        if (res) {
          for (let index = 0; index < res.length; index++) {
            this.getAuthor(res[index].autores_idAutor ?? 0, publicacion);
          }
        }
      });
  }

  getAuthor(idAuthor: number, publicacion: Publicacion): void {
    this._autorService.getAuthor(idAuthor).subscribe((res: unknown[]) => {
      if (res[0] != undefined) {
        publicacion.autor?.push(res[0]);
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

  publicacionPermiso = false;

  getPermisoHasUsuario(DNI: string): void {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res: { permiso_idPermiso?: number }[]) => {
      if (res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          switch (res[index].permiso_idPermiso) {
            case 3:
              this.publicacionPermiso = true;
              break;
            default:
              break;
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
    this._publicacionhasusuarioService
      .getPublicacionHasUsuario(id)
      .subscribe((res: { usuario_DNI?: string; isPrincipal?: number }[]) => {
        if (res.length > 0) {
          let user = this._usuarioService.getUserLogged();
          let index = res.findIndex((item: { usuario_DNI?: string }) => item.usuario_DNI === user.DNI);
          if (index !== -1 && res[index].isPrincipal === 0) {
            localStorage.setItem("thesis-back", "my-thesis");
            this._router.navigate(["dashboard/edit-thesis/" + id]);
          }
        }
      });
  }
}
