import { DatePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { Member } from "@app/shared/models/member";
import { LookupService } from "@app/shared/services/lookup.service";
import { MemberService } from "@app/shared/services/member.service";
import { NewsService } from "@app/shared/services/news.service";
import { firstValueFrom } from "rxjs";

import type { DetailNewsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class DetailNewsDataService {
  private readonly newsService = inject(NewsService);
  private readonly memberService = inject(MemberService);
  private readonly lookup = inject(LookupService);
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

    const newsTypesMap = new Map(this.lookup.newsTypes().map((t) => [t.id, t]));
    const tipoNoticia = noticia.newsTypeId ? (newsTypesMap.get(noticia.newsTypeId)?.name ?? "") : "";

    let autorName = "";
    let autorPhoto: string | null = null;
    let autorPhotoUrl: string | null = null;
    let autorId: number | null = null;

    if (noticia.authorId != null) {
      try {
        const members = await firstValueFrom(this.memberService.listMembers());
        const autor = (members as Member[]).find((m) => m.id === noticia.authorId);
        if (autor) {
          autorName = `${autor.firstName} ${autor.lastName}`.trim();
          autorPhoto = autor.photo;
          autorPhotoUrl = autor.photoUrl ?? null;
          autorId = autor.id;
        }
      } catch {
        // author not found, leave defaults
      }
    }

    return {
      noticia,
      tipoNoticia,
      autorName,
      autorPhoto,
      autorPhotoUrl,
      autorId,
      dia,
      mes,
      anio,
    };
  }
}
