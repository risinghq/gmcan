import { SlicePipe } from "@angular/common";
import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
import { BrowserService } from "@app/shared/services/browser.service";
import { SessionService } from "@app/shared/services/session.service";

import type { HomeNewsItem, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Component({
  selector: "app-home",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, MatProgressBar, MatButton, MatCard, MatIcon, SlicePipe],
})
export default class HomeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);
  private browser = inject(BrowserService);

  language: any = {};
  expandedKey: string | null = null;

  progress = 100;
  info: Group = createGroup();
  miembros: Member[] = [];
  articulos = 0;
  tesis = 0;
  resumenes = 0;
  lineasInvestigacion: HomeViewModel["lineasInvestigacion"] = [];
  linesPreview: HomeViewModel["linesPreview"] = [];
  newsItems: HomeNewsItem[] = [];
  featuredNews: HomeNewsItem = {} as HomeNewsItem;
  aboutUs: string[] = [];
  metodos: Method[] = [];
  publicaciones: HomePublicacion[] = [];
  proyectos: HomeProyecto[] = [];

  ngOnInit(): void {
    this.language = this.session.language();

    const home = this.route.snapshot.data["home"] as HomeViewModel;
    this.info = home.info;
    this.publicaciones = home.publicaciones;
    this.proyectos = home.proyectos;
    this.newsItems = home.newsItems;
    this.featuredNews = home.featuredNews ?? ({} as HomeNewsItem);
    this.lineasInvestigacion = home.lineasInvestigacion;
    this.linesPreview = home.linesPreview;
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
    this.router.navigate(["/home/detail-member/" + user.id], { queryParams: { from: "home" } });
  }

  openNewsDetail(newsItem: { id?: number }): void {
    if (!newsItem.id) {
      return;
    }
    this.router.navigate(["/home/detail-news/" + newsItem.id], { queryParams: { from: "home" } });
    this.scroll();
  }

  scroll(): void {
    this.browser.scrollIntoViewById("main-toolbar");
  }
}
