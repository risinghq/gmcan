import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";
import { getMethod, getMethodPhoto, listMethods } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const rows = await listMethods();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getMethod(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

router.get("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getMethodPhoto(id);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: "method", fileName: row.photo });
});

export default router;
