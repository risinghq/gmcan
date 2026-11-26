import { z } from "zod";

import { AssetLinksSchema, PublicationKindCodeSchema, ThesisKindCodeSchema } from "./common.js";

export const PublicationAuthorSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("registered"),
    authorOrder: z.number(),
    memberId: z.number(),
    name: z.string(),
    photoUrl: z.string().nullable(),
    photoAlt: z.string(),
  }),
  z.object({
    kind: z.literal("external"),
    authorOrder: z.number(),
    name: z.string(),
  }),
]);

export const PublicationSubtypeSchema = z.discriminatedUnion("kindCode", [
  z.object({
    kindCode: z.literal("journal_article"),
    journalArticle: z.object({ journalId: z.number().nullable().optional(), issue: z.number().nullable().optional() }),
  }),
  z.object({
    kindCode: z.literal("conference_paper"),
    conferencePaper: z.object({ eventId: z.number().nullable() }),
  }),
  z.object({
    kindCode: z.literal("thesis"),
    thesis: z.object({ universityId: z.number().nullable(), thesisKindCode: ThesisKindCodeSchema.nullable() }),
  }),
]);

export const PublicPublicationSchema = z.object({
  id: z.number(),
  title: z.string(),
  asset: AssetLinksSchema.nullable(),
  abstract: z.string().nullable(),
  doi: z.string().nullable(),
  publishedAt: z.string(),
  kindCode: PublicationKindCodeSchema,
  subtype: PublicationSubtypeSchema,
  updatedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const PublicPublicationWithAuthorsSchema = PublicPublicationSchema.extend({
  authors: z.array(PublicationAuthorSchema),
});

export const PublicationCountsSchema = z.record(PublicationKindCodeSchema, z.number().int().nonnegative());

export type PublicationAuthor = z.infer<typeof PublicationAuthorSchema>;
export type PublicationSubtype = z.infer<typeof PublicationSubtypeSchema>;
export type PublicPublication = z.infer<typeof PublicPublicationSchema>;
export type PublicPublicationWithAuthors = z.infer<typeof PublicPublicationWithAuthorsSchema>;
export type PublicationCounts = z.infer<typeof PublicationCountsSchema>;
