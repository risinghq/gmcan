import { SlicePipe } from "@angular/common";
import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { MatCard } from "@angular/material/card";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { IconComponent } from "@app/shared/components/icon/icon.component";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { SessionService } from "@app/shared/services/session.service";
import { EmphasisPipe } from "@app/shared/utils/emphasis";

import type { HomeNewsItem, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Component({
  selector: "app-home",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AvatarComponent, RouterLink, MatProgressBar, MatCard, IconComponent, SlicePipe, EmphasisPipe],
})
export default class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);

  language: any = {};
  expandedKey: string | null = null;

  progress = 100;
  info: Group = createGroup();
  memberCount = 0;
  articulos = 0;
  tesis = 0;
  resumenes = 0;
  linesPreview: HomeViewModel["linesPreview"] = [];
  newsItems: HomeNewsItem[] = [];
  featuredNews: HomeNewsItem = {} as HomeNewsItem;
  aboutUs: string[] = [];
  metodos: HomeViewModel["metodos"] = [];
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
    this.linesPreview = home.linesPreview;
    this.metodos = home.metodos;
    this.memberCount = home.memberCount;
    this.aboutUs = home.aboutUs;
    this.articulos = home.articulos;
    this.tesis = home.tesis;
    this.resumenes = home.resumenes;
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
}
