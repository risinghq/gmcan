import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { getProjectLocalized, listProjectsLocalized } from "../../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const StatusCode = z.enum(["planned", "active", "completed", "archived"]);
const FilterQuery = z.object({ statusCode: StatusCode.optional() });

router.get("/", validate("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { statusCode } = c.req.valid("query");
  const projects = await listProjectsLocalized(locale, statusCode);
  return c.json(projects);
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getProjectLocalized(id, locale);
  if (!row) throw notFound();
  return c.json(row);
});

export default router;
