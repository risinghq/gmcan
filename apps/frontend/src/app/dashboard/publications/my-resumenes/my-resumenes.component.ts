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
import { Router } from "@angular/router";
import { Publicacion } from "@app/shared/models/publicacion";
import { EventoService } from "@app/shared/services/evento.service";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
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
  _router = inject(Router);
  _revistasService = inject(RevistaService);
  private _publicacionService = inject(PublicacionService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  private _publicacionAutoresService = inject(PublicacionAutoresService);
  private _usuarioService = inject(UsuarioService);
  _usuarioHasPermisoService = inject(UsuarioHasPermisoService);
  private _eventoService = inject(EventoService);
  private _session = inject(SessionService);

  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "evento"];
  dataSource: MatTableDataSource<Publicacion> = new MatTableDataSource<Publicacion>([]);

  articulos: Publicacion[] = [];
  url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  selectedTab: string | null = null;
  ngOnInit(): void {
    this.getUserArticles();
  }

  getUserArticles(): void {
    const user = this._usuarioService.getUserLogged();
    this.getPermisoHasUsuario(user?.DNI ?? "");
    this._publicacionAutoresService.getByUser(user?.DNI ?? "").subscribe((res) => {
      if (res) {
        this.articulos = [];
        for (const item of res) {
          this.getArticle(item.publicacion_idPublicacion);
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
          for (const articulo of this.articulos) {
            const d = new Date(articulo.fechaPublicacion ?? "");
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            articulo.fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
            articulo.fecha = this.titlecasePipe.transform(articulo.fecha ?? "");
            articulo.autor = [];
            this.getAuthors(articulo);
            this.getSpeEvento(articulo);
          }
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.matSort();
        this.dataSource.paginator = this.paginator();
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

  addResumen(): void {
    this._session.setResumenBack("my-abstracts");
    this._router.navigate(["dashboard/add-resumen/"]);
  }

  editResumen(id: number): void {
    this._publicacionAutoresService.getForPublication(id).subscribe((authors) => {
      const user = this._usuarioService.getUserLogged();
      const isPrincipal = authors.some((a) => a.kind === "registered" && a.DNI === user?.DNI && a.isPrincipal === 0);
      if (isPrincipal || this.publicacionPermiso) {
        this._session.setResumenBack("my-abstracts");
        this._router.navigate(["dashboard/edit-resumen/" + id]);
      }
    });
  }
}
