import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { SharedShareButtonsComponent } from "@app/shared/components/shared-share-buttons.component";
import { Languages } from "@app/shared/models/languages";
import type { News } from "@app/shared/models/news";
import { GLOBAL } from "@app/shared/services/global";
import { NavigationHistoryService } from "@app/shared/services/navigation-history.service";
import { PreviousPageService } from "@app/shared/services/previouspage.service";
import { SessionService } from "@app/shared/services/session.service";

import type { DetailNewsViewModel } from "./types";

@Component({
  selector: "app-detail-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  imports: [MatProgressSpinner, MatIcon, NewsComponent, SharedShareButtonsComponent],
})
export default class DetailNewsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly previousService = inject(PreviousPageService);
  private readonly session = inject(SessionService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);

  noticia: News = {} as News;
  tipoNoticia = "";
  autorName = "";
  autorPhoto: string | null = null;
  autorId: number | null = null;
  previouspage = "";
  previouslink: string | null = null;
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
    this.autorId = newsData.autorId;
    this.dia = newsData.dia;
    this.mes = newsData.mes;
    this.anio = newsData.anio;

    this.meta.updateTag({ name: "title", content: String(this.noticia.title) });
    this.meta.updateTag({ property: "og:title", content: String(this.noticia.title) });
    this.titleService.setTitle(String(this.noticia.title));

    this.previouslink = this.navigationHistory.previousUrl();
    this.previouspage = this.previousService.getPreviousPage(this.previouslink ?? "");
    this.cargado = true;
  }
}
