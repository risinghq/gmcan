import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@app/shared/components/avatar.component";
import { BreadcrumbComponent, type Crumb } from "@app/shared/components/breadcrumb.component";
import { NewsMetaComponent } from "@app/shared/components/news-meta.component";
import NewsComponent from "@app/shared/components/news/news.component";
import { ShareLinksComponent } from "@app/shared/components/share-links.component";
import type { PublicNewsDetail } from "@app/shared/models/news";
import { originLabel, originRoute, parsePublicOrigin } from "@app/shared/routing/public-origin";
import { GLOBAL } from "@app/shared/services/global";
import { SeoService } from "@app/shared/services/seo.service";
import { SessionService } from "@app/shared/services/session.service";

import type { DetailNewsViewModel } from "./types";

@Component({
  selector: "app-detail-news",
  templateUrl: "./component.html",
  styleUrl: "./component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, AvatarComponent, RouterLink, NewsComponent, NewsMetaComponent, ShareLinksComponent],
})
export default class DetailNewsComponent {
  private readonly seo = inject(SeoService);

  readonly news = input.required<DetailNewsViewModel>();
  readonly from = input<string>();

  protected readonly language = inject(SessionService).language;
  protected readonly item = computed(() => this.news().newsItem);
  protected readonly shareUrl = computed(() => GLOBAL.app(`detail-news/${this.item().id}`));

  protected readonly trail = computed((): Crumb[] => {
    const origin = parsePublicOrigin(this.from());
    const link = originRoute(origin);
    const current = { label: this.language().detailNews };
    return link === "/" ? [current] : [{ label: originLabel(origin, this.language()), link }, current];
  });

  constructor() {
    effect(() => this.describe(this.item(), this.shareUrl()));
  }

  private describe(item: PublicNewsDetail, url: string): void {
    this.seo.setDescription(item.summary ?? "");
    this.seo.setImage(item.asset);
    this.seo.setStructuredData({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary || undefined,
      image: item.asset ? [item.asset] : undefined,
      datePublished: item.publishedAt,
      dateModified: item.updatedAt ?? item.publishedAt,
      author: item.authorName
        ? {
            "@type": "Person",
            name: item.authorName,
            url: item.authorId ? GLOBAL.app(`detail-member/${item.authorId}`) : undefined,
          }
        : undefined,
      publisher: { "@type": "ResearchOrganization", name: "GMCAN", logo: GLOBAL.app("img/gmcan.jpg") },
      mainEntityOfPage: url,
    });
  }
}
