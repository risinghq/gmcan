import { NgClass, SlicePipe } from "@angular/common";
import { DatePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { Noticia } from "@app/shared/models/noticia";
import { TipoNoticia } from "@app/shared/models/tiponoticia";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import {
  NgbPagination,
  NgbPaginationPrevious,
  NgbPaginationNumber,
  NgbPaginationNext,
} from "@ng-bootstrap/ng-bootstrap/pagination";

@Component({
  selector: "app-main-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [
    MatProgressBar,
    MatIcon,
    MatProgressSpinner,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgbPagination,
    NgbPaginationPrevious,
    NgbPaginationNumber,
    NgbPaginationNext,
    NgClass,
    SlicePipe,
  ],
})
export default class MainNewsComponent implements OnInit {
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _noticiaService = inject(NoticiaService);
  _route = inject(ActivatedRoute);
  lookup = inject(LookupService);
  _router = inject(Router);
  _usuarioService = inject(UsuarioService);
  private _session = inject(SessionService);
  private titleService = inject(Title);

  public noticias: Noticia[] = [];
  public tiponoticias: TipoNoticia[] = [];
  public screenWidth: number;
  url: string;
  constructor() {
    this.screenWidth = window.innerWidth;
    this.url = GLOBAL.url;
  }
  numberShown = 5;
  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = window.innerWidth;
  }
  public categorySelected = -1;
  public categoryNombre = "";
  public page = 1;
  public pageSize = 10;
  language: any = {};
  ngOnInit(): void {
    this.language = this._session.language();
    this.titleService.setTitle("GMCAN | " + this.language.news);
    this.categoryNombre = this.language.newsText[0].categoryTitle;
    this.tiponoticias = this.lookup.tiposNoticia().toSorted((a, b) => ((a.nombre ?? "") > (b.nombre ?? "") ? 1 : -1));
    this.getNoticia();
  }

  progress = 0;
  augment = 100 / 2;
  allCharged: boolean | null = false;

  getNoticia(): void {
    this._noticiaService.getNoticias().subscribe((res: Noticia[]) => {
      if (res != null) {
        this.progress = this.progress + this.augment;
        res.sort((a: Noticia, b: Noticia) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.noticias = res;
        for (let index = 0; index < this.noticias.length; index++) {
          if (
            (this.noticias[index].tipoNoticia_idtipoNoticia != this.categorySelected && this.categorySelected != -1) ||
            this.noticias[index].estado == 0
          ) {
            this.noticias.splice(index, 1);
            index--;
          }
        }
        for (let index = 0; index < this.tiponoticias.length; index++) {
          const found = res.findIndex(
            (x: Noticia) => x.tipoNoticia_idtipoNoticia === this.tiponoticias[index].idtipoNoticia,
          );
          if (found == -1) {
            this.tiponoticias.splice(index, 1);
            index--;
          }
        }
        for (let index = 0; index < this.noticias.length; index++) {
          for (let j = 0; j < this.tiponoticias.length; j++) {
            if (this.noticias[index].tipoNoticia_idtipoNoticia === this.tiponoticias[j].idtipoNoticia) {
              this.noticias[index].nombreTipoNoticia = this.tiponoticias[j].nombre;
            }
          }
          const d = new Date(this.noticias[index].fechaPublicacion ?? "");
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.noticias[index].fechaPublicacion = this.datePipe.transform(d, "MMMM dd, y", "es") ?? undefined;
          this.noticias[index].fechaPublicacion = this.titlecasePipe.transform(
            this.noticias[index].fechaPublicacion ?? "",
          );
          this.getUsuario(this.noticias[index].autorPublicacion ?? "", index);
          this.progress = this.progress + this.augment / this.noticias.length;
        }
      }
    });
  }

  selectCategory(idtipoNoticia: number, nombre: string): void {
    this.categorySelected = idtipoNoticia;
    this.categoryNombre = nombre;
    this.allCharged = null;
    this.getNoticia();
    this.page = 1;
  }
  detalleNoticia(noticia: Noticia): void {
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
    this.scroll();
  }
  scroll(): void {
    const el = document.getElementById("main-toolbar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  getUsuario(idUser: string, i: number): void {
    this._usuarioService.getUser(idUser).subscribe((res: any[]) => {
      if (res[0] != undefined) {
        this.allCharged = true;
        if (this.noticias[i] != undefined) {
          this.noticias[i].autor = res[0].nombre + " " + res[0].apellidoPaterno;
        }
      }
    });
  }
}
