import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { requirePermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import {
  createNews,
  deleteNews,
  getNewsItem,
  listAdminNews,
  type NewsUpsertInput,
  toAdminNewsView,
  updateNews,
} from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const ListQuery = z.object({
  q: z.string().trim().optional(),
  status: z.coerce.number().int().optional(),
  newsTypeId: z.coerce.number().int().optional(),
  authorId: z.coerce.number().int().optional(),
  sortBy: z.enum(["publishedAt", "title", "status", "authorName", "categoryName"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
});

const NewsBody = z.object({
  status: z.number().int(),
  publishedAt: z.string().optional(),
  authorId: z.number().int(),
  newsTypeId: z.number().int(),
  priority: z.number().int().optional(),
  translations: translationsSchema({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    body: z.string().trim().min(1),
  }),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("news.read")(c, next);
  return requirePermission("news.write")(c, next);
});

router.get("/", zValidator("query", ListQuery), async (c) => {
  const query = c.req.valid("query");
  return c.json(await listAdminNews(query));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsItem(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  const view = toAdminNewsView(row);
  return c.json({
    ...view,
    asset: await resolveAssetAccessUrl({ resourceType: "news", resourceId: view.id, slot: "photo" }),
  });
});

router.post("/", zValidator("json", NewsBody), async (c) => {
  const data: NewsUpsertInput = c.req.valid("json");
  const id = await createNews(data);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", NewsBody), async (c) => {
  const { id } = c.req.valid("param");
  const data: NewsUpsertInput = c.req.valid("json");
  await updateNews(id, data);
  return c.json(okStatus());
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteNews(id);
  return c.json(okStatus());
});

export default router;
