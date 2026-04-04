import { DatePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { Router, ActivatedRoute, Params } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { createNoticia } from "@app/shared/models/factories";
import type { Noticia } from "@app/shared/models/noticia";
import type { Usuario } from "@app/shared/models/usuario";
import { GLOBAL } from "@app/shared/services/global";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { SessionService } from "@app/shared/services/session.service";
import { TipoNoticiaService } from "@app/shared/services/tiponoticia.service";
import { UsuarioService } from "@app/shared/services/usuario.service";

@Component({
  selector: "app-detail-news",
  templateUrl: "./detail-news.component.html",
  styleUrls: ["./detail-news.component.scss"],
  imports: [MatProgressSpinner, MatIcon, NewsComponent],
})
export default class DetailNewsComponent implements OnInit {
  public noticia: Noticia;
  public previouspage = "";
  public previouslink: string | null = null;
  public usuario: Usuario;
  url: string;
  constructor(
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _noticiaService: NoticiaService,
    public _tipoNoticiaService: TipoNoticiaService,
    public _route: ActivatedRoute,
    public _router: Router,
    public _previousService: PreviousPageService,
    public _usuarioService: UsuarioService,
    private _session: SessionService,
    public meta: Meta,
    private titleService: Title,
  ) {
    this.noticia = createNoticia();
    this.usuario = {
      DNI: "",
      nombre: "",
      nombreCompleto: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      foto: "",
      isPrincipal: 0,
    };
    this.url = GLOBAL.url;
  }

  language: any = {};
  ngOnInit(): void {
    this.language = this._session.getLanguageData<any>() ?? {};
    this.cargado = false;
    this.getNoticia();
    this.previouslink = sessionStorage.getItem("previous-page");
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
  }

  dia = "";
  mes = "";
  anio = "";
  datere = new Date();
  cargado = false;
  public fbicon = "../../assets/img/Facebook.svg";
  public twitter = "../../assets/img/twitter.svg";

  mouseEnter(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "../../assets/img/Facebook2.svg";
        break;
      case 2:
        this.twitter = "../../assets/img/twitter2.svg";
        break;
    }
  }

  mouseLeave(int: number): void {
    switch (int) {
      case 1:
        this.fbicon = "../../assets/img/Facebook.svg";
        break;
      case 2:
        this.twitter = "../../assets/img/twitter.svg";
        break;
    }
  }

  getNoticia(): void {
    this._route.params.forEach((params: Params) => {
      const idNoticia = Number(params["id"]);
      this._noticiaService.getNoticia(idNoticia).subscribe((res: any) => {
        this.noticia = res[0];
        const d = new Date(this.noticia.fechaPublicacion ?? "");
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        this.noticia.fechaPublicacion = this.datePipe.transform(d, "MM/dd/y", "es") ?? undefined;
        this.datere = new Date(String(this.noticia.fechaPublicacion));
        this.dia = this.datePipe.transform(this.datere, "dd") ?? "";
        this.mes = this.datePipe.transform(this.datere, "MMMM") ?? "";
        this.anio = this.datePipe.transform(this.datere, "y") ?? "";
        this.meta.updateTag({ name: "title", content: String(this.noticia.titulo) });
        this.meta.updateTag({ property: "og:title", content: String(this.noticia.titulo) });
        this.titleService.setTitle(String(this.noticia.titulo));
        const newsBody = document.getElementById("newsBody");
        if (newsBody) {
          newsBody.innerHTML = this.noticia.cuerpo ?? "";
        }
        this.getTipoNoticia(this.noticia.tipoNoticia_idtipoNoticia ?? 0);
        this.getUsuario(this.noticia.autorPublicacion ?? "");
      });
      this.cargado = true;
    });
  }

  getTipoNoticia(idTipoNoticia: number): void {
    this._tipoNoticiaService.getTipoNews(idTipoNoticia).subscribe((res: any) => {
      this.noticia.nombreTipoNoticia = res[0].nombre;
    });
  }

  getUsuario(idUsuario: string): void {
    this._usuarioService.getUser(idUsuario).subscribe((res: Usuario[]) => {
      this.usuario = res[0];
    });
  }

  fb(e: Event): boolean {
    const url = location.href;
    e.preventDefault();
    const facebookWindow = window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + url,
      "facebook-share-dialog",
      "height=350,width=600",
    );
    if (facebookWindow?.focus) {
      facebookWindow.focus();
    }
    return false;
  }
}
