import { SlicePipe } from "@angular/common";
import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { MatCard } from "@angular/material/card";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NewsMetaComponent } from "@app/shared/components/news-meta.component";
import { ProjectItemComponent } from "@app/shared/components/project-item.component";
import { ProjectMembersComponent } from "@app/shared/components/project-members.component";
import { PublicationAuthorsComponent } from "@app/shared/components/publication-authors.component";
import { PublicationItemComponent } from "@app/shared/components/publication-item.component";
import { createGroup } from "@app/shared/models/factories";
import type { Group } from "@app/shared/models/group";
import { SessionService } from "@app/shared/services/session.service";
import { EmphasisPipe } from "@app/shared/utils/emphasis";
import { MoneyPipe } from "@app/shared/utils/money";

import type { HomeCounter, HomeNewsItem, HomeProyecto, HomePublicacion, HomeViewModel } from "./types";

@Component({
  selector: "app-home",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    PublicationAuthorsComponent,
    PublicationItemComponent,
    ProjectItemComponent,
    ProjectMembersComponent,
    RouterLink,
    MatProgressBar,
    MatCard,
    NewsMetaComponent,
    SlicePipe,
    EmphasisPipe,
    MoneyPipe,
  ],
})
export default class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);

  language: any = {};

  progress = 100;
  info: Group = createGroup();
  counters: HomeCounter[] = [];
  linesPreview: HomeViewModel["linesPreview"] = [];
  newsItems: HomeNewsItem[] = [];
  featuredNews: HomeNewsItem | null = null;
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
    this.featuredNews = home.featuredNews;
    this.linesPreview = home.linesPreview;
    this.metodos = home.metodos;
    this.counters = home.counters;
    this.aboutUs = home.aboutUs;
  }
}
