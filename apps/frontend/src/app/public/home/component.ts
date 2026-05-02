import { SlicePipe } from "@angular/common";
import { Component, HostListener, inject, OnInit } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { Meta, Title } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);
  private browser = inject(BrowserService);
  private titleService = inject(Title);
  private meta = inject(Meta);

  language: any = {};
  url = GLOBAL.appUrl;
  screenWidth = this.browser.innerWidth();
  expandedKey: string | null = null;

  progress = 100;
  info: Group = createGroup();
  miembros: Member[] = [];
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
    this.screenWidth = this.browser.innerWidth();
  }

  ngOnInit(): void {
    this.language = this.session.language();
    this.titleService.setTitle("GMCAN | UNMSM");

    const home = this.route.snapshot.data["home"] as HomeViewModel;
    this.info = home.info;
    this.publicaciones = home.publicaciones;
    this.proyectos = home.proyectos;
    this.noticias = home.noticias;
    this.noticiaPrincipal = home.noticiaPrincipal ?? ({} as HomeNoticia);
    this.lineasInvestigacion = home.lineasInvestigacion;
    this.metodos = home.metodos;
    this.miembros = home.miembros;
    this.aboutUs = home.aboutUs;
    this.articulos = home.articulos;
    this.tesis = home.tesis;
    this.resumenes = home.resumenes;
  }

  publicationLink(_value: unknown): void {}

  navigate(route: string): void {
    this.router.navigate([route]);
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

  profile(user: { id?: number }): void {
    if (!user.id) {
      return;
    }
    this.router.navigate(["/home/detail-member/" + user.id]);
  }

  detalleNoticia(noticia: { id?: number }): void {
    if (!noticia.id) {
      return;
    }
    this.router.navigate(["/home/detail-news/" + noticia.id]);
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }

  fbsharing(i: number): boolean {
    const title = String(this.publicaciones[i]?.title ?? "");
    this.meta.updateTag({ name: "description", content: title });

    this.browser.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url)}`,
      "facebook-share-dialog",
      "width=626,height=436",
    );
    return false;
  }
}
