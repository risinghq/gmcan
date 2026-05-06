import { Component, OnInit, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { SharedShareButtonsComponent } from "@app/shared/components/shared-share-buttons.component";
import { Languages } from "@app/shared/models/languages";
import type { PublicNewsDetail } from "@app/shared/models/news";
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

  newsItem: PublicNewsDetail = {} as PublicNewsDetail;
  newsTypeNameLabel = "";
  authorNameLabel = "";
  authorPhoto: string | null = null;
  authorId: number | null = null;
  previouspage = "Inicio";
  previouslink = "/home";
  cargado = false;
  day = "";
  month = "";
  year = "";
  shareUrl = "";
  language: (typeof Languages)[number] = Languages[0];

  ngOnInit(): void {
    this.language = this.session.language();
    const newsData = this.route.snapshot.data["news"] as DetailNewsViewModel;

    this.newsItem = newsData.newsItem;
    this.newsTypeNameLabel = newsData.newsTypeNameLabel;
    this.authorNameLabel = newsData.authorNameLabel;
    this.authorPhoto = newsData.authorPhoto;
    this.authorId = newsData.authorId;
    this.day = newsData.day;
    this.month = newsData.month;
    this.year = newsData.year;

    this.meta.updateTag({ name: "title", content: String(this.newsItem.title) });
    this.meta.updateTag({ property: "og:title", content: String(this.newsItem.title) });
    this.titleService.setTitle(String(this.newsItem.title));
    this.shareUrl = GLOBAL.app(`detail-news/${this.newsItem.id}`);
    const origin = parsePublicOrigin(this.route);
    const originInfo = getPublicOriginInfo(origin);
    this.previouslink = originInfo.route;
    this.previouspage = originInfo.label;
    this.cargado = true;
  }
}
