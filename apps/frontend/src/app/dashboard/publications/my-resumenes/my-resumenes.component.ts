import { TitleCasePipe, DatePipe, NgIf } from "@angular/common";
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
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";

@Component({
  selector: "app-my-resumenes",
  templateUrl: "./my-resumenes.component.html",
  styleUrls: ["./my-resumenes.component.scss"],
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
export default class MyResumenesComponent implements OnInit {
  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "evento"];
  dataSource: MatTableDataSource<Publicacion> = new MatTableDataSource<Publicacion>([]);

  articulos: Publicacion[] = [];
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
    private _eventoService: EventoService,
    private _session: SessionService,
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
    this.getPermisoHasUsuario(user?.DNI ?? "");
    this._publicacionhasusuarioService
      .searchPublicacionHasUsuario(user?.DNI ?? "")
      .subscribe((res: { publicacion_idPublicacion?: number }[]) => {
        if (res) {
          this.articulos = [];
          for (let index = 0; index < res.length; index++) {
            this.getArticle(res[index].publicacion_idPublicacion ?? 0);
          }
        }
      });
  }

  getArticle(idPublicacion: number): void {
    this._publicacionService.getPublication(idPublicacion).subscribe((res: Publicacion[]) => {
      if (res[0]) {
        if (res[0].tipoPublicacion_idTipoPublicacion === 3) {
          this.articulos.push(res[0]);
          this.articulos.sort((a: Publicacion, b: Publicacion) =>
            (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
              ? 1
              : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
                ? -1
                : 0,
          );
          for (let index = 0; index < this.articulos.length; index++) {
            const d = new Date(this.articulos[index].fechaPublicacion ?? "");
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            this.articulos[index].fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
            this.articulos[index].fecha = this.titlecasePipe.transform(this.articulos[index].fecha ?? "");
            this.articulos[index].usuario = [];
            this.articulos[index].autor = [];
            this.getArticlesUsers(this.articulos[index]);
            this.getArticlesAuthors(this.articulos[index]);
            this.getSpeEvento(this.articulos[index]);
          }
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getSpeEvento(publicacion: Publicacion): void {
    this._eventoService.getEvento(publicacion.evento_idEvento ?? 0).subscribe((res: { nombre?: string }[]) => {
      if (res) {
        publicacion.evento = res[0]?.nombre ?? "";
      }
    });
  }

  getArticlesUsers(publicacion: Publicacion): void {
    this._publicacionhasusuarioService
      .getPublicacionHasUsuario(publicacion.idPublicacion ?? 0)
      .subscribe((res: { isPrincipal?: number; usuario_DNI?: string }[]) => {
        if (res) {
          const indexPrincipal = res.findIndex((x: { isPrincipal?: number }) => x.isPrincipal === 0);
          if (indexPrincipal !== -1) {
            this.getUsuario(res[indexPrincipal].usuario_DNI ?? "", publicacion);
          }
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

  getArticlesAuthors(publicacion: Publicacion): void {
    this._publicacionhasautorService
      .getPublicacionHasAutor(publicacion.idPublicacion ?? 0)
      .subscribe((res: { isPrincipal?: number; autores_idAutor?: number }[]) => {
        if (res) {
          const indexPrincipal = res.findIndex((x: { isPrincipal?: number }) => x.isPrincipal === 0);
          if (indexPrincipal !== -1) {
            this.getAuthor(res[indexPrincipal].autores_idAutor ?? 0, publicacion);
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

  addResumen(): void {
    this._session.setResumenBack("my-abstracts");
    this._router.navigate(["dashboard/add-resumen/"]);
  }

  editResumen(id: number): void {
    this._publicacionhasusuarioService
      .getPublicacionHasUsuario(id)
      .subscribe((res: { usuario_DNI?: string; isPrincipal?: number }[]) => {
        if (res.length > 0) {
          const user = this._usuarioService.getUserLogged();
          const index = res.findIndex((item: { usuario_DNI?: string }) => item.usuario_DNI === user?.DNI);
          if ((index !== -1 && res[index].isPrincipal === 0) || this.publicacionPermiso) {
            this._session.setResumenBack("my-abstracts");
            this._router.navigate(["dashboard/edit-resumen/" + id]);
          }
        }
      });
  }
}
