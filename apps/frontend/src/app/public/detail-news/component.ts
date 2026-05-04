import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { SharedShareButtonsComponent } from "@app/shared/components/shared-share-buttons.component";
import { Languages } from "@app/shared/models/languages";
import type { News } from "@app/shared/models/news";
import { getPublicOriginInfo, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { GLOBAL } from "@app/shared/services/global";
import { SessionService } from "@app/shared/services/session.service";

import type { DetailNewsViewModel } from "./types";

@Component({
  selector: "app-detail-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatProgressSpinner, MatIcon, RouterLink, NewsComponent, SharedShareButtonsComponent],
})
export default class DetailNewsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);

  noticia: News = {} as News;
  tipoNoticia = "";
  autorName = "";
  autorPhoto: string | null = null;
  autorPhotoUrl: string | null = null;
  autorId: number | null = null;
  previouspage = "Inicio";
  previouslink = "/home";
  cargado = false;
  dia = "";
  mes = "";
  anio = "";
  url = GLOBAL.url;
  language: (typeof Languages)[number] = Languages[0];

  ngOnInit(): void {
    this.language = this.session.language();
    const newsData = this.route.snapshot.data["news"] as DetailNewsViewModel;

    this.noticia = newsData.noticia;
    this.tipoNoticia = newsData.tipoNoticia;
    this.autorName = newsData.autorName;
    this.autorPhoto = newsData.autorPhoto;
    this.autorPhotoUrl = newsData.autorPhotoUrl ?? null;
    this.autorId = newsData.autorId;
    this.dia = newsData.dia;
    this.mes = newsData.mes;
    this.anio = newsData.anio;

    this.meta.updateTag({ name: "title", content: String(this.noticia.title) });
    this.meta.updateTag({ property: "og:title", content: String(this.noticia.title) });
    this.titleService.setTitle(String(this.noticia.title));
    const origin = parsePublicOrigin(this.route);
    const originInfo = getPublicOriginInfo(origin);
    this.previouslink = originInfo.route;
    this.previouspage = originInfo.label;
    this.cargado = true;
  }
}
