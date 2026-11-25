import { z } from "zod";

import { type NewsKindCode, NewsKindCodeSchema, type NewsStatusCode, NewsStatusCodeSchema } from "../public/common.js";
import type { Translations } from "./content.js";

export const NewsTranslationSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  body: z.string().trim().min(1),
});
export type NewsTranslation = z.infer<typeof NewsTranslationSchema>;

export const NewsWriteFieldsSchema = z.object({
  statusCode: NewsStatusCodeSchema,
  /** A `YYYY-MM-DD` date. A create without one is published today. */
  publishedAt: z.string().optional(),
  authorId: z.number().int(),
  newsKindCode: NewsKindCodeSchema,
  priority: z.number().int().optional(),
});

export interface NewsWrite extends z.infer<typeof NewsWriteFieldsSchema> {
  translations: Translations<NewsTranslation>;
}

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
