import { z } from "zod";

import { NewsKindCodeSchema, NewsStatusCodeSchema } from "./common.js";

export const PublicNewsListQuerySchema = z.object({
  q: z.string().trim().optional(),
  newsKindCode: NewsKindCodeSchema.optional(),
  sortBy: z.enum(["publishedAt", "title"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
});

export const PublicNewsListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string(),
  publishedAt: z.string(),
  asset: z.string().nullable(),
  priority: z.number().nullable(),
  authorId: z.number(),
  newsKindCode: NewsKindCodeSchema,
  authorName: z.string(),
  authorPhotoUrl: z.string(),
  authorPhotoAlt: z.string(),
  newsKindName: z.string(),
});

export const PublicNewsListResponseSchema = z.object({
  items: z.array(PublicNewsListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const PublicNewsDetailSchema = PublicNewsListItemSchema.extend({
  body: z.string(),
  statusCode: NewsStatusCodeSchema,
  updatedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export type PublicNewsListQuery = z.infer<typeof PublicNewsListQuerySchema>;
export type PublicNewsListItem = z.infer<typeof PublicNewsListItemSchema>;
export type PublicNewsListResponse = z.infer<typeof PublicNewsListResponseSchema>;
export type PublicNewsDetail = z.infer<typeof PublicNewsDetailSchema>;
