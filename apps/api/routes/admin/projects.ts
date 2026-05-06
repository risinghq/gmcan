import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  addMemberToProject,
  createProject,
  deleteProject,
  endProject,
  listProjectMembers,
  listAdminProjects,
  removeMemberFromProject,
  restartProject,
  updateProject,
} from "../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const StatusCode = z.enum(["planned", "active", "completed", "archived"]);
const CurrencyCode = z.enum(["pen", "usd"]);
const FundingSourceCode = z.enum(["vrip", "none"]);

const ProjectBody = z.object({
  code: z.string().min(1),
  fundedAmountMinor: z.number().int(),
  statusCode: StatusCode.optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  researchLineId: z.number().int(),
  currencyCode: CurrencyCode,
  fundingSourceCode: FundingSourceCode,
  translations: translationsSchema({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

const FilterQuery = z.object({
  statusCode: StatusCode.optional(),
  q: z.string().optional(),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("projects.read")(c, next);
  return requirePermission("projects.write")(c, next);
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { statusCode, q } = c.req.valid("query");
  return c.json(await listAdminProjects(statusCode, q));
});

router.post("/", zValidator("json", ProjectBody), async (c) => {
  const data = c.req.valid("json");
  const id = await createProject(data);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", ProjectBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await updateProject(id, data);
  return c.json(okStatus());
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteProject(id);
  return c.json(okStatus());
});

router.put("/:id/end", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await endProject(id);
  return c.json(okStatus());
});

router.put("/:id/restart", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await restartProject(id);
  return c.json(okStatus());
});

router.get("/:id/members", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listProjectMembers(id);
  return c.json(rows);
});

router.post(
  "/:id/members",
  zValidator("param", IdParam),
  zValidator("json", z.object({ memberId: z.number().int() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { memberId } = c.req.valid("json");
    await addMemberToProject(id, memberId);
    return c.json(okStatus(), 201);
  },
);

router.delete(
  "/:id/members/:memberId",
  zValidator("param", IdParam.extend({ memberId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, memberId } = c.req.valid("param");
    await removeMemberFromProject(id, memberId);
    return c.json(okStatus());
  },
);

export default router;
