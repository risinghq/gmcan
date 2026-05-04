import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  clearNewsPhoto,
  createNews,
  deleteNews,
  getNewsItem,
  getNewsPhoto,
  listNews,
  type NewsUpsertInput,
  toAdminNewsView,
  setNewsPhoto,
  updateNews,
} from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const NEWS_FILE = { directory: "news", kind: "image" } as const;

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

router.get("/", async (c) => {
  const rows = await listNews();
  return c.json(rows.map(toAdminNewsView));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsItem(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toAdminNewsView(row));
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
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteNews(id);
  return c.json({ status: 1 });
});

router.put("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await getNewsPhoto(id);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, NEWS_FILE);
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setNewsPhoto(id, fileName);
  if (current.photo && current.photo !== fileName) {
    await deleteUploadedFile({ directory: NEWS_FILE.directory, fileName: current.photo });
  }
  return c.json({ status: 1 });
});

router.delete("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsPhoto(id);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  await deleteUploadedFile({ directory: NEWS_FILE.directory, fileName: row.photo });
  await clearNewsPhoto(id);
  return c.json({ status: 1 });
});

export default router;
