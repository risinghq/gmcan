import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getProject, listProjects } from "../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({ status: z.coerce.number().int().optional() });

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { status } = c.req.valid("query");
  const rows = await listProjects(status);
  return c.json(rows);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getProject(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

export default router;
