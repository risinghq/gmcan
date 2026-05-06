import { z } from "zod";

import { PublicationKindCodeSchema, ThesisKindCodeSchema } from "../public/common.js";

export const AdminPublicationSubtypeSchema = z.discriminatedUnion("kindCode", [
  z.object({
    kindCode: z.literal("journal_article"),
    journalArticle: z.object({
      journalId: z.number().nullable(),
      journalName: z.string().nullable(),
      issue: z.number().nullable(),
    }),
  }),
  z.object({
    kindCode: z.literal("conference_paper"),
    conferencePaper: z.object({
      eventId: z.number().nullable(),
      eventName: z.string().nullable(),
    }),
  }),
  z.object({
    kindCode: z.literal("thesis"),
    thesis: z.object({
      universityId: z.number().nullable(),
      universityName: z.string().nullable(),
      thesisKindCode: ThesisKindCodeSchema.nullable(),
      thesisKindName: z.string().nullable(),
    }),
  }),
]);

export const AdminPublicationListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  publishedAt: z.string(),
  kindCode: PublicationKindCodeSchema,
  subtype: AdminPublicationSubtypeSchema,
  eventName: z.string().nullable(),
  journalName: z.string().nullable(),
  universityName: z.string().nullable(),
  thesisKindName: z.string().nullable(),
  doi: z.string().nullable(),
  publishedAtLabel: z.string(),
  firstAuthorName: z.string(),
  firstAuthorAsset: z.string().nullable(),
});

export const AdminPublicationListQuerySchema = z.object({
  kindCode: PublicationKindCodeSchema.optional(),
  eventId: z.coerce.number().int().positive().optional(),
  journalId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).optional(),
});

export const RefDependenciesResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  byKind: z.object({
    journalArticle: z.number().int().nonnegative(),
    conferencePaper: z.number().int().nonnegative(),
    thesis: z.number().int().nonnegative(),
  }),
  canDelete: z.boolean(),
});

export type AdminPublicationSubtype = z.infer<typeof AdminPublicationSubtypeSchema>;
export type AdminPublicationListItem = z.infer<typeof AdminPublicationListItemSchema>;
export type AdminPublicationListQuery = z.infer<typeof AdminPublicationListQuerySchema>;
export type RefDependenciesResponse = z.infer<typeof RefDependenciesResponseSchema>;
