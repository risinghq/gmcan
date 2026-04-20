import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";
import { getGroupFile, listAbout, listGroups } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const SlotParam = z.object({ slot: z.enum(["facilities", "header", "footer"]) });

const SLOT_COLUMN = {
  facilities: "facilitiesPhoto" as const,
  header: "logoHeader" as const,
  footer: "logoFooter" as const,
};

router.get("/", async (c) => {
  const groups = await listGroups();
  return c.json(groups);
});

router.get("/:id/about", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listAbout(id);
  return c.json(rows);
});

router.get("/:id/files/:slot", zValidator("param", IdParam.extend(SlotParam.shape)), async (c) => {
  const { id, slot } = c.req.valid("param");
  const column = SLOT_COLUMN[slot];
  const row = await getGroupFile(id, column);
  const fileName = row?.[column];
  if (!fileName) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: "group", fileName });
});

export default router;
