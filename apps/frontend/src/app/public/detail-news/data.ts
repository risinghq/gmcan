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
  private readonly _newsService = inject(NewsService);
  private readonly _memberService = inject(MemberService);
  private readonly _lookup = inject(LookupService);
  private readonly _datePipe = inject(DatePipe);

  async load(id: number): Promise<DetailNewsViewModel> {
    const noticia = await firstValueFrom(this._newsService.getNews(id));

    if (!noticia) {
      throw new Error(`News with ID ${id} not found`);
    }

    const publishedAt = new Date(noticia.publishedAt ?? "");
    if (String(publishedAt) !== "Invalid Date") {
      publishedAt.setMinutes(publishedAt.getMinutes() + publishedAt.getTimezoneOffset());
    }

    const dia = String(publishedAt) === "Invalid Date" ? "" : (this._datePipe.transform(publishedAt, "dd") ?? "");
    const mes =
      String(publishedAt) === "Invalid Date" ? "" : (this._datePipe.transform(publishedAt, "MMMM", "es") ?? "");
    const anio = String(publishedAt) === "Invalid Date" ? "" : (this._datePipe.transform(publishedAt, "y") ?? "");

    const newsTypesMap = new Map(this._lookup.newsTypes().map((t) => [t.id, t]));
    const tipoNoticia = noticia.newsTypeId ? (newsTypesMap.get(noticia.newsTypeId)?.name ?? "") : "";

    let autorName = "";
    let autorPhoto: string | null = null;
    let autorId: number | null = null;

    if (noticia.authorId) {
      try {
        const members = await firstValueFrom(this._memberService.listMembers());
        const autor = (members as Member[]).find((m) => m.id === noticia.authorId);
        if (autor) {
          autorName = `${autor.firstName} ${autor.lastName}`.trim();
          autorPhoto = autor.photo;
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
      autorId,
      dia,
      mes,
      anio,
    };
  }
}
