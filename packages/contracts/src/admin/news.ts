import { z } from "zod";

import type { Translations } from "./content.js";

export const NewsStatusCodeSchema = z.enum(["draft", "published", "archived"]);
export type NewsStatusCode = z.infer<typeof NewsStatusCodeSchema>;

export const NewsKindCodeSchema = z.enum(["general", "research", "event"]);
export type NewsKindCode = z.infer<typeof NewsKindCodeSchema>;

export const NewsTranslationSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  body: z.string().trim().min(1),
});
export type NewsTranslation = z.infer<typeof NewsTranslationSchema>;

/** The fields of a news write besides its translations. */
export const NewsWriteFieldsSchema = z.object({
  statusCode: NewsStatusCodeSchema,
  /** A `YYYY-MM-DD` date; a create without one is published today. */
  publishedAt: z.string().optional(),
  authorId: z.number().int(),
  newsKindCode: NewsKindCodeSchema,
  priority: z.number().int().optional(),
});

/** `POST /admin/news` and `PUT /admin/news/:id`. */
export interface NewsWrite extends z.infer<typeof NewsWriteFieldsSchema> {
  translations: Translations<NewsTranslation>;
}

/** `GET /admin/news/:id`. */
export interface AdminNews {
  id: number;
  statusCode: NewsStatusCode;
  publishedAt: string;
  priority: number | null;
  authorId: number;
  newsKindCode: NewsKindCode;
  createdAt: string;
  updatedAt: string;
  translations: Translations<NewsTranslation>;
  asset: string | null;
}
