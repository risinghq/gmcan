import { PublicNewsListQuerySchema } from "@gmcan/contracts/public";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getPublicNewsDetail, listPublicNews } from "../../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", zValidator("query", PublicNewsListQuerySchema), async (c) => {
  const locale = c.get("locale");
  const query = c.req.valid("query");
  const response = await listPublicNews(locale, {
    q: query.q,
    statusCode: query.statusCode,
    newsKindCode: query.newsKindCode,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: query.page,
    pageSize: query.pageSize,
  });
  return c.json(response);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getPublicNewsDetail(id, locale);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

export default router;
