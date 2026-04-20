import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import {
  createPublication,
  deletePublication,
  getPublicationEditView,
  getPublicationFile,
  listPublications,
  replaceAuthors,
  setPublicationFile,
  updatePublication,
} from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FILE_CONFIG = { directory: "publications", kind: "document" } as const;

const AuthorEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), memberId: z.number().int(), isPrincipal: z.number().int() }),
  z.object({ kind: z.literal("external"), externalName: z.string().min(1), isPrincipal: z.number().int() }),
]);

const PublicationFields = z.object({
  title: z.string().min(1),
  abstractES: z.string().optional(),
  abstractEN: z.string().optional(),
  doi: z.string().optional(),
  publishedAt: z.string(),
  journalIssue: z.number().optional(),
  typeId: z.number().int(),
  journalId: z.number().int().optional(),
  universityId: z.number().int().optional(),
  thesisTypeId: z.number().int().optional(),
  eventId: z.number().int().optional(),
});

const CreateBody = z.object({ data: PublicationFields, authors: z.array(AuthorEntry) });
const UpdateBody = z.object({ data: PublicationFields, authors: z.array(AuthorEntry) });

router.get("/", async (c) => {
  const rows = await listPublications();
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const result = await getPublicationEditView(id);
  if (!result.publication) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", zValidator("json", CreateBody), async (c) => {
  const { data, authors } = c.req.valid("json");
  const id = await createPublication(data, authors);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const { data, authors } = c.req.valid("json");
  await updatePublication(id, data, authors);
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deletePublication(id);
  return c.json({ status: 1 });
});

router.put("/:id/file", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await getPublicationFile(id);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, FILE_CONFIG);
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setPublicationFile(id, fileName);
  if (current.file && current.file !== fileName) {
    await deleteUploadedFile({ directory: FILE_CONFIG.directory, fileName: current.file });
  }
  return c.json({ status: 1 });
});

router.put("/:id/authors", zValidator("param", IdParam), zValidator("json", z.array(AuthorEntry)), async (c) => {
  const { id } = c.req.valid("param");
  const authors = c.req.valid("json");
  await replaceAuthors(id, authors);
  return c.json({ status: 1 });
});

export default router;
