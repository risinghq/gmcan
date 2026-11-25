import { Component, OnInit, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterLink } from "@angular/router";
import NewsComponent from "@app/shared/components/news/news.component";
import { SharedShareButtonsComponent } from "@app/shared/components/shared-share-buttons.component";
import { Languages } from "@app/shared/models/languages";
import type { PublicNewsDetail } from "@app/shared/models/news";
import { getPublicOriginInfo, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

import type { DetailNewsViewModel } from "./types";

@Component({
  selector: "app-detail-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatProgressSpinner, MatIcon, RouterLink, NewsComponent, SharedShareButtonsComponent],
})
export default class DetailNewsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);
  private readonly seo = inject(SeoService);

  newsItem: PublicNewsDetail = {} as PublicNewsDetail;
  newsTypeNameLabel = "";
  authorNameLabel = "";
  authorId: number | null = null;
  previouspage = "Inicio";
  previouslink = "/home";
  cargado = false;
  writtenOn = "";
  shareUrl = "";
  language: (typeof Languages)[number] = Languages[0];

  ngOnInit(): void {
    this.language = this.session.language();
    const newsData = this.route.snapshot.data["news"] as DetailNewsViewModel;

    this.newsItem = newsData.newsItem;
    this.newsTypeNameLabel = newsData.newsTypeNameLabel;
    this.authorNameLabel = newsData.authorNameLabel;
    this.authorId = newsData.authorId;
    this.writtenOn = newsData.writtenOn;

    this.shareUrl = GLOBAL.app(`home/detail-news/${this.newsItem.id}`);
    this.seo.setPageTitle(this.newsItem.title);
    this.seo.setDescription(this.newsItem.summary ?? "");
    this.seo.setImage(this.newsItem.asset);
    this.seo.setStructuredData({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: this.newsItem.title,
      description: this.newsItem.summary || undefined,
      image: this.newsItem.asset ? [this.newsItem.asset] : undefined,
      datePublished: this.newsItem.publishedAt,
      dateModified: this.newsItem.updatedAt ?? this.newsItem.publishedAt,
      author: this.newsItem.authorName
        ? {
            "@type": "Person",
            name: this.newsItem.authorName,
            url: this.newsItem.authorId ? GLOBAL.app(`home/detail-member/${this.newsItem.authorId}`) : undefined,
          }
        : undefined,
      publisher: { "@type": "ResearchOrganization", name: "GMCAN", logo: GLOBAL.app("img/gmcan.jpg") },
      mainEntityOfPage: this.shareUrl,
    });
    const origin = parsePublicOrigin(this.route);
    const originInfo = getPublicOriginInfo(origin);
    this.previouslink = originInfo.route;
    this.previouspage = originInfo.label;
    this.cargado = true;
  }
}
