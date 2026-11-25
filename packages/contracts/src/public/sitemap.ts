import { z } from "zod";

export const SitemapEntrySchema = z.object({ id: z.number().int().positive(), updatedAt: z.string() });

/** The pages with their own URL beyond the fixed routes. */
export const SitemapSchema = z.object({
  news: z.array(SitemapEntrySchema),
  members: z.array(SitemapEntrySchema),
});

export type Sitemap = z.infer<typeof SitemapSchema>;
