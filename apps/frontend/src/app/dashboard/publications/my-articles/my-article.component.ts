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
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { PublicacionHasAutorService } from "@app/shared/services/publicacionhasautor.service";
import { PublicacionHasUsuarioService } from "@app/shared/services/publicacionhasusuario.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasPermisoService } from "@app/shared/services/usuariohaspermiso.service";

@Component({
  selector: "app-my-article",
  templateUrl: "./my-article.component.html",
  styleUrls: ["./my-article.component.scss"],
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
export default class MyArticleComponent implements OnInit {
  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "DOI"];
  dataSource: MatTableDataSource<Publicacion>;

  articulos: Array<Publicacion>;
  url;

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
  ) {
    this.url = GLOBAL.url;
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.getUserArticles();
  }

  getUserArticles() {
    let user = this._usuarioService.getUserLogged();
    this.getPermisoHasUsuario(user.DNI);
    this._publicacionhasusuarioService.searchPublicacionHasUsuario(user.DNI).subscribe((res) => {
      if (res) {
        this.articulos = [];
        for (let index = 0; index < res.length; index++) {
          this.getArticle(res[index].publicacion_idPublicacion);
        }
      }
    });
  }

  getArticle(idPublicacion) {
    this._publicacionService.getPublication(idPublicacion).subscribe((res) => {
      if (res[0]) {
        if (res[0].tipoPublicacion_idTipoPublicacion == 1) {
          this.articulos.push(res[0]);
          this.articulos.sort((a, b) =>
            a.fechaPublicacion < b.fechaPublicacion ? 1 : b.fechaPublicacion < a.fechaPublicacion ? -1 : 0,
          );
          for (let index = 0; index < this.articulos.length; index++) {
            var d = new Date(this.articulos[index].fechaPublicacion);
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            this.articulos[index].fecha = this.datePipe.transform(d, "MMMM, y", "es");
            this.articulos[index].fecha = this.titlecasePipe.transform(this.articulos[index].fecha);
            this.articulos[index].usuario = [];
            this.articulos[index].autor = [];
            this.getArticlesUsers(this.articulos[index]);
            this.getArticlesAuthors(this.articulos[index]);
          }
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getArticlesUsers(publicacion) {
    this._publicacionhasusuarioService.getPublicacionHasUsuario(publicacion.idPublicacion).subscribe((res) => {
      if (res) {
        let indexPrincipal = res.findIndex((x) => x.isPrincipal == 0);
        if (indexPrincipal != -1) {
          this.getUsuario(res[indexPrincipal].usuario_DNI, publicacion);
        }
      }
    });
  }

  getUsuario(idUser, publicacion) {
    this._usuarioService.getUser(idUser).subscribe((res) => {
      if (res[0] != undefined) {
        publicacion.usuario.push(res[0]);
        publicacion.usuario[0].nombreCompleto =
          publicacion.usuario[0].nombre +
          " " +
          publicacion.usuario[0].apellidoPaterno +
          " " +
          publicacion.usuario[0].apellidoMaterno;
      }
    });
  }

  getArticlesAuthors(publicacion) {
    this._publicacionhasautorService.getPublicacionHasAutor(publicacion.idPublicacion).subscribe((res) => {
      if (res) {
        let indexPrincipal = res.findIndex((x) => x.isPrincipal == 0);
        if (indexPrincipal != -1) {
          this.getAuthor(res[indexPrincipal].autores_idAutor, publicacion);
        }
      }
    });
  }

  getAuthor(idAuthor, publicacion) {
    this._autorService.getAuthor(idAuthor).subscribe((res) => {
      if (res[0] != undefined) {
        publicacion.autor.push(res[0]);
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

  publicacionPermiso = false;

  getPermisoHasUsuario(DNI) {
    this._usuarioHasPermisoService.getUsuarioHasPermiso(DNI).subscribe((res) => {
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

  addArticle() {
    localStorage.setItem("article-back", "my-articles");
    this._router.navigate(["dashboard/add-article/"]);
  }

  editArticulo(id) {
    this._publicacionhasusuarioService.getPublicacionHasUsuario(id).subscribe((res) => {
      if (res.length > 0) {
        let user = this._usuarioService.getUserLogged();
        let index = res.findIndex((res) => res.usuario_DNI === user.DNI);
        if ((index != -1 && res[index].isPrincipal == 0) || this.publicacionPermiso) {
          localStorage.setItem("article-back", "my-articles");
          this._router.navigate(["dashboard/edit-article/" + id]);
        }
      }
    });
  }
}
