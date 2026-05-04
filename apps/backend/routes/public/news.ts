import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { assetUrl } from "../../lib/upload.js";
import { localizeField, type Locale } from "../../lib/public-locale.js";
import { getNewsItem, listNews } from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({ status: z.coerce.number().int().optional() });

function toPublicNews(row: Awaited<ReturnType<typeof getNewsItem>>, locale: Locale) {
  if (!row) return null;
  return {
    id: row.id,
    title: localizeField(row, locale, { es: "title", en: "titleEN" }),
    summary: localizeField(row, locale, { es: "summary", en: "summaryEN" }),
    body: localizeField(row, locale, { es: "body", en: "bodyEN" }),
    status: row.status,
    publishedAt: row.publishedAt,
    photo: row.photo,
    photoUrl: assetUrl(row.photo),
    priority: row.priority,
    authorId: row.authorId,
    newsTypeId: row.newsTypeId,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  };
}

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { status } = c.req.valid("query");
  const rows = await listNews(status);
  return c.json(rows.map((row) => toPublicNews(row, locale)));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getNewsItem(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toPublicNews(row, locale));
});

export default router;
