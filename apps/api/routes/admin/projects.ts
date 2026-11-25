import { type AdminProject, ProjectTranslationSchema, ProjectWriteFieldsSchema } from "@gmcan/contracts/admin";
import { ProjectStatusCodeSchema } from "@gmcan/contracts/public";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createProject,
  deleteProject,
  getAdminProject,
  listAdminProjects,
  updateProject,
} from "../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const ProjectBody = ProjectWriteFieldsSchema.extend({
  translations: translationsSchema(ProjectTranslationSchema.shape),
});

const FilterQuery = z.object({
  statusCode: ProjectStatusCodeSchema.optional(),
  q: z.string().optional(),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("projects.read")(c, next);
  return requirePermission("projects.write")(c, next);
});

router.get("/", validate("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { statusCode, q } = c.req.valid("query");
  return c.json(await listAdminProjects(locale, statusCode, q));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const project = await getAdminProject(id);
  if (!project) throw notFound();
  return c.json(project satisfies AdminProject);
});

router.post("/", validate("json", ProjectBody), async (c) => {
  const id = await createProject(c.req.valid("json"));
  return c.json({ id }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", ProjectBody), async (c) => {
  const { id } = c.req.valid("param");
  await updateProject(id, c.req.valid("json"));
  return c.json(okStatus());
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteProject(id);
  return c.json(okStatus());
});

export default router;
