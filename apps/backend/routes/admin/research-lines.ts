import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createResearchLine,
  deleteResearchLine,
  getResearchLine,
  listResearchLines,
  toAdminResearchLineView,
  updateResearchLine,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Body = z.object({
  groupId: z.number().int(),
  translations: translationsSchema({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

const UpdateBody = z.object({
  translations: translationsSchema({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.get("/", async (c) => {
  const rows = await listResearchLines();
  return c.json(rows.map(toAdminResearchLineView));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getResearchLine(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toAdminResearchLineView(row));
});

router.post("/", zValidator("json", Body), async (c) => {
  const data = c.req.valid("json");
  const id = await createResearchLine(data);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await updateResearchLine(id, data);
  return c.json(okStatus());
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteResearchLine(id);
  return c.json(okStatus());
});

export default router;
