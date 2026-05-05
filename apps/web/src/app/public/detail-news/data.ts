import { DatePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { NewsService } from "@app/shared/services/news.service";
import { firstValueFrom } from "rxjs";

import type { DetailNewsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class DetailNewsDataService {
  private readonly newsService = inject(NewsService);
  private readonly datePipe = inject(DatePipe);

  async load(id: number): Promise<DetailNewsViewModel> {
    const newsItem = await firstValueFrom(this.newsService.getNews(id));

    if (!newsItem) {
      throw new Error(`News with ID ${id} not found`);
    }

    const publishedAt = new Date(newsItem.publishedAt ?? "");
    const publishedAtTime = publishedAt.getTime();
    if (!Number.isNaN(publishedAtTime)) {
      publishedAt.setMinutes(publishedAt.getMinutes() + publishedAt.getTimezoneOffset());
    }

    const isPublishedAtValid = !Number.isNaN(publishedAt.getTime());
    const day = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "dd") ?? "") : "";
    const month = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "MMMM", "es") ?? "") : "";
    const year = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "y") ?? "") : "";

    const newsTypeNameLabel = newsItem.newsTypeName ?? "";
    const authorNameLabel = newsItem.authorName ?? "";
    const authorPhoto = newsItem.authorAsset ?? null;
    const authorId = newsItem.authorId ?? null;

    return {
      newsItem,
      newsTypeNameLabel,
      authorNameLabel,
      authorPhoto,
      authorId,
      day,
      month,
      year,
    };
  }
}
