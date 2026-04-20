import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";
import { getResearchLine, getResearchLinePhoto, listResearchLines } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const rows = await listResearchLines();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getResearchLine(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

router.get("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getResearchLinePhoto(id);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: "research-line", fileName: row.photo });
});

export default router;
