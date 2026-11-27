import type { LookupService } from "@app/shared/services/lookup.service";
import type { SortValues } from "@app/shared/tables/list-table";
import { dateLabel } from "@app/shared/utils/date";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

export interface PublicationRow extends PublicPublicationWithAuthors {
  fecha: string;
  thesisTypeName: string;
  universityName: string;
  eventName: string;
}

function toRow(pub: PublicPublicationWithAuthors, lookup: LookupService): PublicationRow {
  const thesis = pub.subtype.kindCode === "thesis" ? pub.subtype.thesis : null;
  const eventId = pub.subtype.kindCode === "conference_paper" ? pub.subtype.conferencePaper.eventId : null;
  return {
    ...pub,
    fecha: dateLabel(pub.publishedAt, "MMMM, y", "es"),
    thesisTypeName: lookup.thesisKinds().find((kind) => kind.code === thesis?.thesisKindCode)?.name ?? "",
    universityName: lookup.universities().find((university) => university.id === thesis?.universityId)?.name ?? "",
    eventName: lookup.events().find((event) => event.id === eventId)?.name ?? "",
  };
}

/** Rows newest first. Reading the lookup signals makes a caller's effect rerun when the names load. */
export function publicationRows(pubs: PublicPublicationWithAuthors[], lookup: LookupService): PublicationRow[] {
  return pubs.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map((pub) => toRow(pub, lookup));
}

export function authoredBy(pubs: PublicPublicationWithAuthors[], memberId: number): PublicPublicationWithAuthors[] {
  return pubs.filter((pub) =>
    pub.authors.some((author) => author.kind === "registered" && author.memberId === memberId),
  );
}

/** A publication table orders its date column by the ISO date, not the month label it shows. */
export const publicationSort: SortValues<PublicationRow> = {
  titulo: (row) => row.title,
  primerAutor: (row) => row.authors[0]?.name ?? "",
  autores: (row) => row.authors[0]?.name ?? "",
  publicacion: (row) => row.publishedAt,
  tipo: (row) => row.thesisTypeName,
  universidad: (row) => row.universityName,
  evento: (row) => row.eventName,
};

export function publicationSearchText(row: PublicationRow): string[] {
  return [
    row.title,
    row.fecha,
    row.thesisTypeName,
    row.universityName,
    row.eventName,
    ...row.authors.map((author) => author.name),
  ];
}
