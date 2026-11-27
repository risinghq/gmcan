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

    const publishedAtLabel = dateText(newsItem.publishedAt, "longDate", this.session.language().locale);

    return { newsItem, publishedAtLabel };
  }
}
