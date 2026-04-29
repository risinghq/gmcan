import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { SharedShareButtonsComponent } from "@app/shared/components/shared-share-buttons.component";
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
  private readonly _route = inject(ActivatedRoute);
  private readonly _navigationHistory = inject(NavigationHistoryService);
  private readonly _previousService = inject(PreviousPageService);
  private readonly _session = inject(SessionService);
  private readonly _meta = inject(Meta);
  private readonly _titleService = inject(Title);

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
  language: any = {};

  ngOnInit(): void {
    this.language = this._session.language();
    const newsData = this._route.snapshot.data["news"] as DetailNewsViewModel;

    this.noticia = newsData.noticia;
    this.tipoNoticia = newsData.tipoNoticia;
    this.autorName = newsData.autorName;
    this.autorPhoto = newsData.autorPhoto;
    this.autorId = newsData.autorId;
    this.dia = newsData.dia;
    this.mes = newsData.mes;
    this.anio = newsData.anio;

    this._meta.updateTag({ name: "title", content: String(this.noticia.title) });
    this._meta.updateTag({ property: "og:title", content: String(this.noticia.title) });
    this._titleService.setTitle(String(this.noticia.title));

    this.previouslink = this._navigationHistory.previousUrl();
    this.previouspage = this._previousService.getPreviousPage(this.previouslink ?? "");
    this.cargado = true;
  }
}
