import { z } from "zod";

import { PublicationKindCodeSchema, ThesisKindCodeSchema } from "../public/common.js";
import type { Translations } from "./content.js";

export const PublicationTranslationSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().optional(),
});
export type PublicationTranslation = z.infer<typeof PublicationTranslationSchema>;

/** An author in byline order: the first author has order 1. */
export const PublicationAuthorWriteSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), memberId: z.number().int(), authorOrder: z.number().int().min(1) }),
  z.object({
    kind: z.literal("external"),
    externalName: z.string().trim().min(1),
    authorOrder: z.number().int().min(1),
  }),
]);
export type PublicationAuthorWrite = z.infer<typeof PublicationAuthorWriteSchema>;

/**
 * A registered candidate is a member. An external candidate is a name an earlier byline already
 * used.
 */
export type AuthorCandidate =
  | { kind: "registered"; memberId: number; name: string; photoUrl: string; photoAlt: string }
  | { kind: "external"; name: string };

export const PublicationSubtypeWriteSchema = z.discriminatedUnion("kindCode", [
  z.object({
    kindCode: z.literal("journal_article"),
    journalArticle: z.object({
      journalId: z.number().int().positive().optional(),
      issue: z.number().int().positive().optional(),
    }),
  }),
  z.object({
    kindCode: z.literal("conference_paper"),
    conferencePaper: z.object({ eventId: z.number().int().positive() }),
  }),
  z.object({
    kindCode: z.literal("thesis"),
    thesis: z.object({ universityId: z.number().int().positive(), thesisKindCode: ThesisKindCodeSchema }),
  }),
]);
export type PublicationSubtypeWrite = z.infer<typeof PublicationSubtypeWriteSchema>;

export const PublicationWriteFieldsSchema = z.object({
  doi: z.string().trim().optional(),
  /** A `YYYY-MM-DD` date. */
  publishedAt: z.string(),
  subtype: PublicationSubtypeWriteSchema,
  /** The whole byline. A write replaces the stored authors. */
  authors: z.array(PublicationAuthorWriteSchema).min(1),
});

export interface PublicationWrite extends z.infer<typeof PublicationWriteFieldsSchema> {
  translations: Translations<PublicationTranslation>;
}

/** `asset` is the link to the attached PDF. */
export interface AdminPublication extends PublicationWrite {
  id: number;
  createdAt: string;
  updatedAt: string;
  asset: string | null;
}

export const AdminPublicationSubtypeSchema = z.discriminatedUnion("kindCode", [
  z.object({
    kindCode: z.literal("journal_article"),
    journalArticle: z.object({
      journalId: z.number().nullable(),
      journalName: z.string(),
      issue: z.number().nullable(),
    }),
  }),
  z.object({
    kindCode: z.literal("conference_paper"),
    conferencePaper: z.object({
      eventId: z.number(),
      eventName: z.string(),
    }),
  }),
  z.object({
    kindCode: z.literal("thesis"),
    thesis: z.object({
      universityId: z.number(),
      universityName: z.string(),
      thesisKindCode: ThesisKindCodeSchema,
      thesisKindName: z.string(),
    }),
  }),
]);

export const AdminPublicationListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  publishedAt: z.string(),
  kindCode: PublicationKindCodeSchema,
  subtype: AdminPublicationSubtypeSchema,
  eventName: z.string(),
  journalName: z.string(),
  universityName: z.string(),
  thesisKindName: z.string(),
  doi: z.string().nullable(),
  publishedAtLabel: z.string(),
  firstAuthorName: z.string(),
  firstAuthorPhotoUrl: z.string(),
  firstAuthorPhotoAlt: z.string(),
});

export const AdminPublicationListQuerySchema = z.object({
  kindCode: PublicationKindCodeSchema.optional(),
  eventId: z.coerce.number().int().positive().optional(),
  journalId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).optional(),
});

export type AdminPublicationSubtype = z.infer<typeof AdminPublicationSubtypeSchema>;
export type AdminPublicationListItem = z.infer<typeof AdminPublicationListItemSchema>;
export type AdminPublicationListQuery = z.infer<typeof AdminPublicationListQuerySchema>;
