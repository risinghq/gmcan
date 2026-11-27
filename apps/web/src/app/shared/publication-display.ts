import type { LookupService } from "@app/shared/services/lookup.service";
import { dateLabel } from "@app/shared/utils/date";
import type { PublicPublication } from "@gmcan/contracts/public";

export type ListablePublication = Omit<PublicPublication, "createdAt" | "updatedAt">;

export type PublicationDisplay<T extends ListablePublication = ListablePublication> = T & {
  date: string;
  kindLabel: string;
  venue: string | null;
  place: string | null;
};

/** Builds a mapper that resolves a publication's lookup ids into the labels a listing shows. */
export function publicationDisplay(lookup: LookupService, locale: string) {
  const kinds = new Map(lookup.publicationKinds().map((kind) => [kind.code, kind.name]));
  const thesisKinds = new Map(lookup.thesisKinds().map((kind) => [kind.code, kind.name]));
  const journals = new Map(lookup.journals().map((journal) => [journal.id, journal.name]));
  const universities = new Map(lookup.universities().map((university) => [university.id, university.name]));
  const events = new Map(lookup.events().map((event) => [event.id, event]));

  return <T extends ListablePublication>(pub: T): PublicationDisplay<T> => {
    const base = { date: dateLabel(pub.publishedAt, "MMMM y", locale), place: null };
    const kindLabel = kinds.get(pub.kindCode) ?? "";
    const subtype = pub.subtype;

    if (subtype.kindCode === "journal_article") {
      const { journalId, issue } = subtype.journalArticle;
      const journal = journalId == null ? undefined : journals.get(journalId);
      const venue = journal ? [journal, issue == null ? "" : `Vol. ${issue}`].filter(Boolean).join(" ") : null;
      return { ...pub, ...base, kindLabel, venue };
    }

    if (subtype.kindCode === "thesis") {
      const { universityId, thesisKindCode } = subtype.thesis;
      const thesisKind = thesisKindCode == null ? undefined : thesisKinds.get(thesisKindCode);
      const venue = (universityId == null ? undefined : universities.get(universityId)) ?? null;
      return { ...pub, ...base, kindLabel: thesisKind ?? kindLabel, venue };
    }

    const event = subtype.conferencePaper.eventId == null ? undefined : events.get(subtype.conferencePaper.eventId);
    const place = [event?.city, event?.country].filter(Boolean).join(", ") || null;
    return { ...pub, ...base, kindLabel, venue: event?.name ?? null, place };
  };
}
