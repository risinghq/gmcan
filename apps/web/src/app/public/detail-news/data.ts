import { Injectable, inject } from "@angular/core";
import { NewsService } from "@app/shared/services/news.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateText } from "@app/shared/utils/date";
import { firstValueFrom } from "rxjs";

import type { DetailNewsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class DetailNewsDataService {
  private readonly newsService = inject(NewsService);
  private readonly session = inject(SessionService);

  async load(id: number): Promise<DetailNewsViewModel> {
    const newsItem = await firstValueFrom(this.newsService.getNews(id));

    if (!newsItem) {
      throw new Error(`News with ID ${id} not found`);
    }

    const language = this.session.language();
    const writtenOn = dateText(newsItem.publishedAt, language.detailNewsText[0].writtenOnFormat, language.locale);

    const newsTypeNameLabel = newsItem.newsKindName ?? "";
    const authorNameLabel = newsItem.authorName ?? "";
    const authorId = newsItem.authorId ?? null;

    return {
      newsItem,
      newsTypeNameLabel,
      authorNameLabel,
      authorId,
      writtenOn,
    };
  }
}
