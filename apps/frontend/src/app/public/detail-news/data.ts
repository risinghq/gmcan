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
    const noticia = await firstValueFrom(this.newsService.getNews(id));

    if (!noticia) {
      throw new Error(`News with ID ${id} not found`);
    }

    const publishedAt = new Date(noticia.publishedAt ?? "");
    const publishedAtTime = publishedAt.getTime();
    if (!Number.isNaN(publishedAtTime)) {
      publishedAt.setMinutes(publishedAt.getMinutes() + publishedAt.getTimezoneOffset());
    }

    const isPublishedAtValid = !Number.isNaN(publishedAt.getTime());
    const dia = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "dd") ?? "") : "";
    const mes = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "MMMM", "es") ?? "") : "";
    const anio = isPublishedAtValid ? (this.datePipe.transform(publishedAt, "y") ?? "") : "";

    const tipoNoticia = noticia.newsTypeName ?? "";
    const autorName = noticia.authorName ?? "";
    const autorPhoto = noticia.authorAsset ?? null;
    const autorId = noticia.authorId ?? null;

    return {
      noticia,
      tipoNoticia,
      autorName,
      autorPhoto,
      autorId,
      dia,
      mes,
      anio,
    };
  }
}
