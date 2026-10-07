import { PublicNewsListQuerySchema } from "@gmcan/contracts/public";
import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { getPublicNewsDetail, listPublicNews } from "../../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", validate("query", PublicNewsListQuerySchema), async (c) => {
  const locale = c.get("locale");
  const query = c.req.valid("query");
  const response = await listPublicNews(locale, {
    q: query.q,
    newsKindCode: query.newsKindCode,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: query.page,
    pageSize: query.pageSize,
  });
  return c.json(response);
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getPublicNewsDetail(id, locale);
  if (!row) throw notFound();
  return c.json(row);
});

export default router;
