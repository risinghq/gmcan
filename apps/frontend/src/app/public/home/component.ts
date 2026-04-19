import { SlicePipe } from "@angular/common";
import { Component, HostListener, inject, OnInit } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { Meta, Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import type { Grupo } from "@app/shared/models/grupo";
import type { Method } from "@app/shared/models/method";
import type { Usuario } from "@app/shared/models/usuario";
import { BrowserService } from "@app/shared/services/browser.service";
import { GLOBAL } from "@app/shared/services/global";
import { SessionService } from "@app/shared/services/session.service";

import type { HomeNoticia, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Component({
  selector: "app-home",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatProgressBar, MatButton, MatCard, MatIcon, SlicePipe],
})
export default class HomeComponent implements OnInit {
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _session = inject(SessionService);
  private _browser = inject(BrowserService);
  private _titleService = inject(Title);
  private _meta = inject(Meta);

  language: any = {};
  url = GLOBAL.appUrl;
  screenWidth = this._browser.innerWidth();
  expandedKey: string | null = null;

  progress = 100;
  info: Grupo = {};
  usuarios: Usuario[] = [];
  articulos = 0;
  tesis = 0;
  resumenes = 0;
  lineasInvestigacion: HomeViewModel["lineasInvestigacion"] = [];
  noticias: HomeNoticia[] = [];
  noticiaPrincipal: HomeNoticia = {} as HomeNoticia;
  aboutUs = "";
  metodos: Method[] = [];
  publicaciones: HomePublicacion[] = [];
  proyectos: HomeProyecto[] = [];

  @HostListener("window:resize", ["$event"])
  onResize(_event: Event): void {
    this.screenWidth = this._browser.innerWidth();
  }

  ngOnInit(): void {
    this.language = this._session.language();
    this._titleService.setTitle("GMCAN | UNMSM");

    const home = this._route.snapshot.data["home"] as HomeViewModel;
    this.info = home.info;
    this.publicaciones = home.publicaciones;
    this.proyectos = home.proyectos;
    this.noticias = home.noticias;
    this.noticiaPrincipal = home.noticiaPrincipal ?? ({} as HomeNoticia);
    this.lineasInvestigacion = home.lineasInvestigacion;
    this.metodos = home.metodos;
    this.usuarios = home.usuarios;
    this.aboutUs = home.aboutUs;
    this.articulos = home.articulos;
    this.tesis = home.tesis;
    this.resumenes = home.resumenes;
  }

  /* Get Grupo */

  /* Get Publicacion */

  /* get Proyectos */

  /* get Noticias */

  /* get Lineas Investigacion */

  /* get Metodos */

  /*  Get Normal */

  /* getUsuarios */

  publicationLink(_value: unknown): void {}

  navigate(route: string): void {
    this._router.navigate([route]);
  }

  toggleExpanded(section: string, index: number): void {
    const key = `${section}:${index}`;
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  isExpanded(section: string, index: number): boolean {
    return this.expandedKey === `${section}:${index}`;
  }

  expandLabel(section: string, index: number, seeMore: string, seeLess: string): string {
    return this.isExpanded(section, index) ? seeLess : seeMore;
  }

  profile(user: { DNI?: string }): void {
    if (!user.DNI) {
      return;
    }
    this._router.navigate(["/home/detail-member/" + user.DNI]);
  }

  detalleNoticia(noticia: { idNoticia?: number }): void {
    if (!noticia.idNoticia) {
      return;
    }
    this._router.navigate(["/home/detail-news/" + noticia.idNoticia]);
    this.scroll();
  }

  scroll(): void {
    this._browser.scrollIntoViewById("main-toolbar");
  }

  /* Share Hover */
  fbsharing(i: number): boolean {
    const title = String(this.publicaciones[i]?.titulo ?? "");
    this._meta.updateTag({ name: "description", content: title });

    this._browser.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url)}`,
      "facebook-share-dialog",
      "width=626,height=436",
    );
    return false;
  }
}
