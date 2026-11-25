import { Injectable, inject } from "@angular/core";
import { NewsService } from "@app/shared/services/news.service";
import { dateText } from "@app/shared/utils/date";
import { firstValueFrom } from "rxjs";

import type { DetailNewsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class DetailNewsDataService {
  private readonly newsService = inject(NewsService);

  async load(id: number): Promise<DetailNewsViewModel> {
    const newsItem = await firstValueFrom(this.newsService.getNews(id));

    if (!newsItem) {
      throw new Error(`News with ID ${id} not found`);
    }

    const day = dateText(newsItem.publishedAt, "dd");
    const month = dateText(newsItem.publishedAt, "MMMM");
    const year = dateText(newsItem.publishedAt, "y");

    const newsTypeNameLabel = newsItem.newsKindName ?? "";
    const authorNameLabel = newsItem.authorName ?? "";
    const authorId = newsItem.authorId ?? null;

    return {
      newsItem,
      newsTypeNameLabel,
      authorNameLabel,
      authorId,
      day,
      month,
      year,
    };
  }
}
