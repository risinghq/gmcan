import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveUploadedFile } from "../../lib/upload.js";
import {
  getPublication,
  getPublicationFile,
  listPublications,
  listPublicationsByFilter,
} from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({
  type: z.coerce.number().int().optional(),
  event: z.coerce.number().int().optional(),
  journal: z.coerce.number().int().optional(),
  university: z.coerce.number().int().optional(),
});

const FILE_CONFIG = { directory: "publications", kind: "document" } as const;

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { type, event, journal, university } = c.req.valid("query");
  if (type || event || journal || university) {
    const rows = await listPublicationsByFilter({
      typeId: type,
      eventId: event,
      journalId: journal,
      universityId: university,
    });
    return c.json(rows);
  }
  const rows = await listPublications();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const pub = await getPublication(id);
  if (!pub) return c.json({ error: "Not found" }, 404);
  return c.json(pub);
});

router.get("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getPublicationFile(id);
  if (!row?.file) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: FILE_CONFIG.directory, fileName: row.file });
});

router.get("/:id/file/download", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getPublicationFile(id);
  if (!row?.file) return c.json({ error: "File not found" }, 404);
  return serveUploadedFile(c, { directory: FILE_CONFIG.directory, fileName: row.file, asAttachment: true });
});

export default router;
