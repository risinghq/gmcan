import type { PublicationFields } from "@app/shared/services/publication.service";

export function toIsoDateString(date?: Date): string {
  return date ? new Date(date).toLocaleDateString("sv") : "";
}

export function buildArticlePayload(input: {
  title: string;
  abstract?: string;
  doi?: string;
  publishedAt?: Date;
  journalIssue?: number;
  journalId?: number;
}): PublicationFields {
  return {
    doi: input.doi ?? undefined,
    publishedAt: toIsoDateString(input.publishedAt),
    subtype: {
      kindCode: "journal_article",
      journalArticle: {
        journalId: input.journalId ?? undefined,
        issue: input.journalIssue ?? undefined,
      },
    },
    translations: { es: { title: input.title, abstract: input.abstract ?? undefined } },
  };
}

export function buildThesisPayload(input: {
  title: string;
  abstract?: string;
  publishedAt?: Date;
  universityId: number;
  thesisKindCode: "phd" | "masters";
}): PublicationFields {
  return {
    publishedAt: toIsoDateString(input.publishedAt),
    subtype: {
      kindCode: "thesis",
      thesis: {
        universityId: input.universityId,
        thesisKindCode: input.thesisKindCode,
      },
    },
    translations: { es: { title: input.title, abstract: input.abstract ?? undefined } },
  };
}

export function buildResumenPayload(input: {
  title: string;
  abstract?: string;
  doi?: string;
  publishedAt?: Date;
  eventId: number;
}): PublicationFields {
  return {
    doi: input.doi,
    publishedAt: toIsoDateString(input.publishedAt),
    subtype: { kindCode: "conference_paper", conferencePaper: { eventId: input.eventId } },
    translations: { es: { title: input.title, abstract: input.abstract } },
  };
}
