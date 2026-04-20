import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import {
  createMethod,
  deleteMethod,
  getMethod,
  getMethodPhoto,
  listMethods,
  setMethodPhoto,
  updateMethod,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FILE_CONFIG = { directory: "method", kind: "image" } as const;

const Body = z.object({
  name: z.string().min(1),
  nameEN: z.string().min(1),
  description: z.string(),
  descriptionEN: z.string().optional(),
  groupId: z.number().int(),
});

const UpdateBody = z.object({
  name: z.string().min(1),
  nameEN: z.string().min(1),
  description: z.string(),
  descriptionEN: z.string().optional(),
});

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

router.post("/", zValidator("json", Body), async (c) => {
  const data = c.req.valid("json");
  const id = await createMethod(data);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await updateMethod(id, data);
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMethod(id);
  return c.json({ status: 1 });
});

router.put("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await getMethodPhoto(id);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, FILE_CONFIG);
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setMethodPhoto(id, fileName);
  if (current.photo && current.photo !== fileName) {
    await deleteUploadedFile({ directory: FILE_CONFIG.directory, fileName: current.photo });
  }
  return c.json({ status: 1 });
});

export default router;
