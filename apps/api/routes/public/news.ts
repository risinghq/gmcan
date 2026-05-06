import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getPublicNewsDetail, listPublicNews } from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const StatusCode = z.enum(["draft", "published", "archived"]);
const NewsKindCode = z.enum(["general", "research", "event"]);

const FilterQuery = z.object({
  q: z.string().trim().optional(),
  statusCode: StatusCode.default("published"),
  newsKindCode: NewsKindCode.optional(),
  sortBy: z.enum(["publishedAt", "title"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const query = c.req.valid("query");
  return c.json(
    await listPublicNews(locale, {
      q: query.q,
      statusCode: query.statusCode,
      newsKindCode: query.newsKindCode,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      pageSize: query.pageSize,
    }),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getPublicNewsDetail(id, locale);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

export default router;
