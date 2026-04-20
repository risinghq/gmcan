import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";
import { getNewsItem, getNewsPhoto, listNews } from "../../services/news.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({ status: z.coerce.number().int().optional() });

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { status } = c.req.valid("query");
  const rows = await listNews(status);
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsItem(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

router.get("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getNewsPhoto(id);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: "news", fileName: row.photo });
});

export default router;
