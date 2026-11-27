import { Injectable, inject } from "@angular/core";
import { publicationDisplay } from "@app/shared/publication-display";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { SessionService } from "@app/shared/services/session.service";
import { firstValueFrom } from "rxjs";

import type { PublicationViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class PublicationDataService {
  private readonly publicationService = inject(PublicationService);
  private readonly groupService = inject(GroupService);
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);

  async load(): Promise<PublicationViewModel> {
    const [publicationsRaw, group] = await Promise.all([
      firstValueFrom(this.publicationService.listPublications()),
      firstValueFrom(this.groupService.getGroup()),
    ]);

    const publications = Array.isArray(publicationsRaw) ? publicationsRaw : [];

    const enrich = publicationDisplay(this.lookup, this.session.language().locale);
    const sorted = publications.toSorted((a, b) => ((b.publishedAt ?? "") > (a.publishedAt ?? "") ? 1 : -1));

    return {
      articulos: sorted.filter((p) => p.kindCode === "journal_article").map(enrich),
      tesis: sorted.filter((p) => p.kindCode === "thesis").map(enrich),
      resumenes: sorted.filter((p) => p.kindCode === "conference_paper").map(enrich),
      infoText: group.publicationsSection ?? "",
    };
  }
}
