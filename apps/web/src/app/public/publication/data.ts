import { DatePipe, TitleCasePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { PublicationWithAuthors } from "@app/shared/models/publication";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicationService } from "@app/shared/services/publication.service";
import { requireLocalDate } from "@app/shared/utils/date";
import { firstValueFrom } from "rxjs";

import type { PublicationDisplay, PublicationViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class PublicationDataService {
  private readonly publicationService = inject(PublicationService);
  private readonly groupService = inject(GroupService);
  private readonly lookup = inject(LookupService);
  private readonly datePipe = inject(DatePipe);
  private readonly titlecasePipe = inject(TitleCasePipe);

  async load(): Promise<PublicationViewModel> {
    const [publicationsRaw, group] = await Promise.all([
      firstValueFrom(this.publicationService.listPublications()),
      firstValueFrom(this.groupService.getGroup()),
    ]);

    const publications = Array.isArray(publicationsRaw) ? publicationsRaw : [];

    const tiposMap = new Map(this.lookup.publicationKinds().map((t) => [t.code, t]));
    const tiposTesisMap = new Map(this.lookup.thesisKinds().map((t) => [t.code, t]));
    const revistasMap = new Map(this.lookup.journals().map((j) => [j.id, j]));
    const universidadesMap = new Map(this.lookup.universities().map((u) => [u.id, u]));
    const eventosMap = new Map(this.lookup.events().map((e) => [e.id, e]));

    const sorted = publications.toSorted((a, b) => ((b.publishedAt ?? "") > (a.publishedAt ?? "") ? 1 : -1));

    const enrich = (pub: PublicationWithAuthors): PublicationDisplay => {
      const publishedAtDate = requireLocalDate(pub.publishedAt, "publication.publishedAt");
      const eventId = pub.subtype.kindCode === "conference_paper" ? pub.subtype.conferencePaper.eventId : null;
      const universityId = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.universityId : null;
      const thesisKindCode = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis.thesisKindCode : null;
      const journalId = pub.subtype.kindCode === "journal_article" ? pub.subtype.journalArticle.journalId : null;
      const evento = eventId ? eventosMap.get(eventId) : undefined;
      return {
        ...pub,
        fecha: this.titlecasePipe.transform(this.datePipe.transform(publishedAtDate, "MMMM y", "es") ?? "") ?? "",
        tipoPublicacion: tiposMap.get(pub.kindCode)?.name,
        tipoTesis: thesisKindCode ? tiposTesisMap.get(thesisKindCode)?.name : undefined,
        revista: journalId ? revistasMap.get(journalId)?.name : undefined,
        universidad: universityId ? (universidadesMap.get(universityId)?.name ?? undefined) : undefined,
        evento: evento?.name,
        ciudad: evento?.city ?? null,
        pais: evento?.country ?? null,
      };
    };

    return {
      articulos: sorted.filter((p) => p.kindCode === "journal_article").map(enrich),
      tesis: sorted.filter((p) => p.kindCode === "thesis").map(enrich),
      resumenes: sorted.filter((p) => p.kindCode === "conference_paper").map(enrich),
      infoText: group.publicationsSection ?? "",
    };
  }
}
