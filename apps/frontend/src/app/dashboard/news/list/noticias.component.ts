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
import { ActivatedRoute, Router } from "@angular/router";
import { Noticia } from "@app/shared/models/noticia";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { Usuario } from "@app/shared/models/usuario";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { TabStateService } from "@app/shared/services/tab-state.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

interface NoticiaResponse extends Noticia {
  fechaPublicacion?: string;
  nombreTipoNoticia?: string;
  status?: string;
  autor?: string;
  foto?: string;
}
@Component({
  selector: "app-noticias",
  templateUrl: "./noticias.component.html",
  styleUrl: "./noticias.component.scss",
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
export default class NoticiasComponent implements OnInit {
  _noticiaService = inject(NoticiaService);
  _usuarioService = inject(UsuarioService);
  lookup = inject(LookupService);
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  private _tabState = inject(TabStateService);

  displayedColumns: string[] = ["titulo", "fechaPublicacion", "nombreTipoNoticia", "autor", "status"];
  displayedColumns2: string[] = ["nombre"];
  dataSource = new MatTableDataSource<NoticiaResponse>([]);
  dataSource2 = new MatTableDataSource<TipoNoticia>([]);
  selectedTab = 0;

  url: string;
  public noticias: NoticiaResponse[] = [];
  public tiponoticias: TipoNoticia[] = [];

  ngOnInit(): void {
    this.selectedTab = this._tabState.newsTab();
    this.tiponoticias = [...this.lookup.tiposNoticia()];
    this.tiponoticias.sort((a, b) => ((a.nombre ?? "") > (b.nombre ?? "") ? 1 : -1));
    this.dataSource2 = new MatTableDataSource(this.tiponoticias);
    this.dataSource2.sort = this.sort2();
    this.dataSource2.paginator = this.paginator2();
    this.getNoticia();
  }

  readonly paginator = viewChild.required(MatPaginator);
  readonly matSort = viewChild.required(MatSort);

  readonly paginator2 = viewChild.required(MatPaginator);
  readonly sort2 = viewChild.required(MatSort);

  constructor() {
    this.url = GLOBAL.url;
  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */

  getNoticia(): void {
    this._noticiaService.getNoticias().subscribe((res: NoticiaResponse[]) => {
      if (res != null) {
        res.sort((a: NoticiaResponse, b: NoticiaResponse) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.noticias = res;
        this.dataSource = new MatTableDataSource(this.noticias);
        this.dataSource.paginator = this.paginator();
        this.dataSource.sort = this.matSort();
        for (let index = 0; index < this.noticias.length; index++) {
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia === this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia = this.tiponoticias[j].nombre ?? "";
            }
            if (this.noticias[index].estado === 1) {
              this.noticias[index].status = "Activo";
            } else {
              this.noticias[index].status = "Inactivo";
            }
          }
          const d = new Date(this.noticias[index].fechaPublicacion ?? new Date());
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.noticias[index].fechaPublicacion = this.datePipe.transform(d, "MMMM dd, y", "es") ?? "";
          this.noticias[index].fechaPublicacion =
            this.titlecasePipe.transform(this.noticias[index].fechaPublicacion) ?? "";
          this.getUsuario(this.noticias[index].autorPublicacion ?? "", index);
        }
      }
    });
  }

  getUsuario(idUser: string, i: number): void {
    this._usuarioService.getUser(idUser).subscribe((res: Usuario[]) => {
      if (res[0] != undefined) {
        if (this.noticias[i] != undefined) {
          this.noticias[i].autor = `${res[0].nombre ?? ""} ${res[0].apellidoPaterno ?? ""}`.trim();
          this.noticias[i].foto = res[0].foto ?? "";
        }
      }
    });
  }

  displayedNotFound = false;
  displayedNotFound2 = false;

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

  addCategory(): void {
    this._router.navigate(["dashboard/add-category"]);
  }

  editCategory(id: number): void {
    this._router.navigate(["dashboard/edit-category/" + id]);
  }

  addNews(): void {
    this._router.navigate(["dashboard/add-news"]);
  }

  editNews(id: number): void {
    this._router.navigate(["dashboard/edit-news/" + id]);
  }

  changedTab(event: number): void {
    this._tabState.newsTab.set(event);
  }
}
