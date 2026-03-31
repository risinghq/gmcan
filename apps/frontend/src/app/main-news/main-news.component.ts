import { Location } from "@angular/common";
import { DatePipe } from "@angular/common";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";

import { Noticia } from "../models/noticia";
import { TipoNoticia } from "../models/tiponoticia";
import { GLOBAL } from "../services/global";
import { NoticiaService } from "../services/noticia.service";
import { TipoNoticiaService } from "../services/tiponoticia.service";
import { UsuarioService } from "../services/usuario.service";

@Component({
  standalone: false,
  selector: "app-main-news",
  templateUrl: "./main-news.component.html",
  styleUrls: ["./main-news.component.scss"],
})
export class MainNewsComponent implements OnInit {
  public noticias: Array<Noticia>;
  public tiponoticias: Array<TipoNoticia>;
  public screenWidth;
  url;
  constructor(
    public titlecasePipe: TitleCasePipe,
    public datePipe: DatePipe,
    public _noticiaService: NoticiaService,
    public _route: ActivatedRoute,
    public _tiponoticiaService: TipoNoticiaService,
    public location: Location,
    public _router: Router,
    public _usuarioService: UsuarioService,
    private titleService: Title,
  ) {
    this.screenWidth = window.innerWidth;
    this.noticias = [];
    this.url = GLOBAL.url;
  }
  numberShown;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.screenWidth = window.innerWidth;
  }
  public categorySelected = -1;
  public categoryNombre;
  public page;
  public pageSize;
  language;
  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle("GMCAN | " + this.language.news);
    this.categoryNombre = this.language.newsText[0].categoryTitle;
    this.page = 1;
    this.pageSize = 10;
    this.getTipoNoticias();
  }

  progress = 0;
  augment = 100 / 2;
  allCharged;

  getNoticia() {
    this._noticiaService.getNoticias().subscribe((res) => {
      if (res != null) {
        this.progress = this.progress + this.augment;
        res.sort((a, b) =>
          a.fechaPublicacion < b.fechaPublicacion ? 1 : b.fechaPublicacion < a.fechaPublicacion ? -1 : 0,
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
          let found = res.findIndex((x) => x.tipoNoticia_idtipoNoticia === this.tiponoticias[index].idtipoNoticia);
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
          var d = new Date(this.noticias[index].fechaPublicacion);
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          this.noticias[index].fechaPublicacion = this.datePipe.transform(d, "MMMM dd, y", "es");
          this.noticias[index].fechaPublicacion = this.titlecasePipe.transform(this.noticias[index].fechaPublicacion);
          this.getUsuario(this.noticias[index].autorPublicacion, index);
          this.progress = this.progress + this.augment / this.noticias.length;
        }
      }
    });
  }

  selectCategory(idtipoNoticia, nombre) {
    this.categorySelected = idtipoNoticia;
    this.categoryNombre = nombre;
    this.allCharged = null;
    this.getNoticia();
    this.page = 1;
  }
  getTipoNoticias() {
    this._tiponoticiaService.getTipoNoticia().subscribe((res) => {
      res.sort((a, b) => (a.nombre > b.nombre ? 1 : -1));
      this.tiponoticias = res;
      this.getNoticia();
    });
  }

  detalleNoticia(noticia) {
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
    this.scroll();
    this.getTipoNoticias();
  }
  scroll() {
    let el = document.getElementById("main-toolbar");
    el.scrollIntoView({ behavior: "smooth" });
  }

  getUsuario(idUser, i) {
    this._usuarioService.getUser(idUser).subscribe((res) => {
      if (res[0] != undefined) {
        this.allCharged = true;
        if (this.noticias[i] != undefined) {
          this.noticias[i].autor = res[0].nombre + " " + res[0].apellidoPaterno;
        }
      }
    });
  }
}
