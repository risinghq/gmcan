import type { PublicationFields } from "@app/shared/services/publication.service";

export function toIsoDateString(date?: Date): string {
  return date ? new Date(date).toLocaleDateString("sv") : "";
}

export function buildArticlePayload(input: {
  title: string;
  abstractES?: string;
  abstractEN?: string;
  doi?: string;
  publishedAt?: Date;
  journalIssue?: number;
  journalId?: number;
}): PublicationFields {
  return {
    title: input.title,
    abstractES: input.abstractES ?? undefined,
    abstractEN: input.abstractEN ?? undefined,
    doi: input.doi ?? undefined,
    publishedAt: toIsoDateString(input.publishedAt),
    journalIssue: input.journalIssue ?? undefined,
    typeId: 1,
    journalId: input.journalId ?? undefined,
  };
}

export function buildThesisPayload(input: {
  title: string;
  abstractES?: string;
  abstractEN?: string;
  publishedAt?: Date;
  universityId?: number;
  thesisTypeId?: number;
}): PublicationFields {
  return {
    title: input.title,
    abstractES: input.abstractES ?? undefined,
    abstractEN: input.abstractEN ?? undefined,
    publishedAt: toIsoDateString(input.publishedAt),
    typeId: 2,
    universityId: input.universityId ?? undefined,
    thesisTypeId: input.thesisTypeId ?? undefined,
  };
}

export function buildResumenPayload(input: {
  title: string;
  abstractES?: string;
  abstractEN?: string;
  doi?: string;
  publishedAt?: Date;
  eventId?: number;
}): PublicationFields {
  return {
    title: input.title,
    abstractES: input.abstractES,
    abstractEN: input.abstractEN,
    doi: input.doi,
    publishedAt: toIsoDateString(input.publishedAt),
    typeId: 3,
    eventId: input.eventId,
  };
}
