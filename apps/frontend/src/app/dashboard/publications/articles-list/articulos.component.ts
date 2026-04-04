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
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { Publicacion } from "@app/shared/models/publicacion";
import { Revista } from "@app/shared/models/revista";
import { GLOBAL } from "@app/shared/services/global";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { RevistaService } from "@app/shared/services/revista.service";
import { TabStateService } from "@app/shared/services/tab-state.service";

@Component({
  selector: "app-articulos",
  templateUrl: "./articulos.component.html",
  styleUrls: ["./articulos.component.scss"],
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
export default class ArticulosComponent implements OnInit {
  displayedColumns: string[] = ["titulo", "primerAutor", "publicacion", "DOI"];
  displayedColumns2: string[] = ["nombre"];
  dataSource = new MatTableDataSource<Publicacion>([]);
  dataSource2 = new MatTableDataSource<Revista>([]);

  revistas: Revista[] = [];
  articulos: Publicacion[] = [];
  url: string;

  constructor(
    public _router: Router,
    public _revistasService: RevistaService,
    private _publicacionService: PublicacionService,
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    private _publicacionAutoresService: PublicacionAutoresService,
    private _tabState: TabStateService,
  ) {
    this.url = GLOBAL.url;
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  @ViewChild(MatPaginator, { static: true }) paginator2!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort2!: MatSort;

  selectedTab = 0;
  ngOnInit(): void {
    this.selectedTab = this._tabState.articleTab();
    this.getRevistas();
    this.getArticles();
  }

  getArticles(): void {
    this._publicacionService.getPublicaciones(1).subscribe((res: Publicacion[]) => {
      if (res) {
        res.sort((a: Publicacion, b: Publicacion) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.articulos = res;
        for (const articulo of this.articulos) {
          const d = new Date(articulo.fechaPublicacion ?? new Date());
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          articulo.fecha = this.datePipe.transform(d, "MMMM, y", "es") ?? "";
          articulo.fecha = this.titlecasePipe.transform(articulo.fecha) ?? "";
          articulo.autor = [];
          this.getAuthors(articulo);
        }
        this.dataSource = new MatTableDataSource(this.articulos);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getAuthors(publicacion: Publicacion): void {
    this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0).subscribe((authors) => {
      publicacion.autor = authors;
    });
  }

  getRevistas(): void {
    this._revistasService.getRevistas().subscribe((res: Revista[]) => {
      if (res) {
        this.revistas = res;
        this.dataSource2 = new MatTableDataSource(this.revistas);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
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
    this._tabState.articleTab.set(event);
  }

  addRevista() {
    this._router.navigate(["dashboard/add-revista"]);
  }

  editRevista(id: number): void {
    this._router.navigate(["dashboard/edit-revista/" + id]);
  }

  addArticle() {
    localStorage.setItem("article-back", "articulos");
    this._router.navigate(["dashboard/add-article/"]);
  }

  editArticulo(id: number): void {
    localStorage.setItem("article-back", "articulos");
    this._router.navigate(["dashboard/edit-article/" + id]);
  }
}
