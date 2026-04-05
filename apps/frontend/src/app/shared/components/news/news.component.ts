import { Location, SlicePipe } from "@angular/common";
import { DatePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, HostListener, inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { createNoticia } from "@app/shared/models/factories";
import type { Noticia } from "@app/shared/models/noticia";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { SessionService } from "@app/shared/services/session.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrl: "./news.component.scss",
  imports: [SlicePipe],
})
export default class NewsComponent implements OnInit {
  titlecasePipe = inject(TitleCasePipe);
  datePipe = inject(DatePipe);
  _noticiaService = inject(NoticiaService);
  _route = inject(ActivatedRoute);
  lookup = inject(LookupService);
  location = inject(Location);
  _router = inject(Router);
  _usuarioService = inject(UsuarioService);
  private _session = inject(SessionService);

  public noticias: Noticia[] = [];
  public noticiaPrincipal: Noticia;
  public tiponoticias: TipoNoticia[] = [];
  url: string;

  constructor() {
    this.noticiaPrincipal = createNoticia();
    this.url = GLOBAL.url;
  }
  numberShown = 5;
  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    if (window.innerWidth >= 1300) {
      this.numberShown = 10;
    } else {
      this.numberShown = 5;
    }
  }
  public title = "";
  public idNoticiaE = 0;
  language: any = {};
  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    if (window.innerWidth >= 1300) {
      this.numberShown = 10;
    } else {
      this.numberShown = 5;
    }
    this.tiponoticias = [...this.lookup.tiposNoticia()];
    this.idNoticiaE = this._route.snapshot.params["id"];
    console.log(this.idNoticiaE);
    this.getNoticia();
  }
  ngDoCheck(): void {
    this.title = this.language.news;
    if (this.location.path().slice(1, 12) === "detail-news") {
      this.title = this.language.moreNews;
    }
  }
  getNoticia(): void {
    this._noticiaService.getNoticias().subscribe((res: Noticia[]) => {
      if (res != null) {
        res.sort((a: Noticia, b: Noticia) =>
          (a.fechaPublicacion ?? "") < (b.fechaPublicacion ?? "")
            ? 1
            : (b.fechaPublicacion ?? "") < (a.fechaPublicacion ?? "")
              ? -1
              : 0,
        );
        this.noticias = res;
        for (let index = 0; index < this.noticias.length; index++) {
          if (this.noticias[index].idNoticia == this.idNoticiaE || this.noticias[index].estado == 0) {
            this.noticias.splice(index, 1);
            index--;
            continue;
          }
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
        }
        this.noticiaPrincipal = this.noticias[0];
        this.noticias.splice(0, 1);
        this.getUser(this.noticiaPrincipal.autorPublicacion ?? "");
      }
    });
  }
  getUsuario(idUser: string, i: number): void {
    this._usuarioService.getUser(idUser).subscribe((res: any[]) => {
      if (res[0] != undefined) {
        if (this.noticias[i] != undefined) {
          this.noticias[i].autor = res[0].nombre + " " + res[0].apellidoPaterno;
        }
      }
    });
  }
  getUser(idUser: string): void {
    this._usuarioService.getUser(idUser).subscribe((res: any[]) => {
      if (res[0] != undefined) {
        if (this.noticiaPrincipal != undefined) {
          this.noticiaPrincipal.autor = res[0].nombre + " " + res[0].apellidoPaterno;
        }
      }
    });
  }

  detalleNoticia(noticia: Noticia): void {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
    this.scroll(document.getElementById("main-toolbar"));
  }
  scroll(el: HTMLElement | null): void {
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}
