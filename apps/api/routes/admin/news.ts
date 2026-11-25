import { type AdminNews, NewsTranslationSchema, NewsWriteFieldsSchema } from "@gmcan/contracts/admin";
import { NewsKindCodeSchema, NewsStatusCodeSchema } from "@gmcan/contracts/public";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl } from "../../services/assets/service.js";
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
  statusCode: NewsStatusCodeSchema.optional(),
  newsKindCode: NewsKindCodeSchema.optional(),
  authorId: z.coerce.number().int().optional(),
  sortBy: z.enum(["publishedAt", "title", "statusCode", "authorName", "categoryName"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
});

const NewsBody = NewsWriteFieldsSchema.extend({ translations: translationsSchema(NewsTranslationSchema.shape) });

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("news.read")(c, next);
  return requirePermission("news.write")(c, next);
});

router.get("/", validate("query", ListQuery), async (c) => {
  const locale = c.get("locale");
  const query = c.req.valid("query");
  return c.json(await listAdminNews(locale, query));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsItem(id);
  if (!row) throw notFound();
  const view = await toAdminNewsView(row);
  return c.json({
    ...view,
    asset: await resolveAssetAccessUrl({ ownerType: "news", ownerId: view.id, slot: "photo" }),
  } satisfies AdminNews);
});

router.post("/", validate("json", NewsBody), async (c) => {
  const data: NewsUpsertInput = c.req.valid("json");
  const id = await createNews(data);
  return c.json({ id }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", NewsBody), async (c) => {
  const { id } = c.req.valid("param");
  const data: NewsUpsertInput = c.req.valid("json");
  await updateNews(id, data);
  return c.json(okStatus());
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteNews(id);
  return c.json(okStatus());
});

export default router;
