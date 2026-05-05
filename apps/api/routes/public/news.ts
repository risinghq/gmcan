import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getPublicNewsDetail, listPublicNews, type PublicNewsSortBy } from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({
  q: z.string().trim().optional(),
  status: z.coerce.number().int().default(1),
  newsTypeId: z.coerce.number().int().optional(),
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
      status: query.status,
      newsTypeId: query.newsTypeId,
      sortBy: query.sortBy as PublicNewsSortBy,
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
