import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import {
  addMemberToProject,
  createProject,
  deleteProject,
  endProject,
  listProjectMembers,
  listProjects,
  removeMemberFromProject,
  restartProject,
  searchProjects,
  updateProject,
} from "../../services/project.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const ProjectBody = z.object({
  title: z.string().min(1),
  titleEN: z.string().optional(),
  code: z.string().min(1),
  fundedAmount: z.string(),
  description: z.string(),
  descriptionEN: z.string().optional(),
  status: z.number().int().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  researchLineId: z.number().int(),
  currencyId: z.number().int(),
  fundingSourceId: z.number().int(),
});

const FilterQuery = z.object({
  status: z.coerce.number().int().optional(),
  q: z.string().optional(),
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { status, q } = c.req.valid("query");
  if (q) return c.json(await searchProjects(q, status));
  return c.json(await listProjects(status));
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
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteProject(id);
  return c.json({ status: 1 });
});

router.put("/:id/end", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await endProject(id);
  return c.json({ status: 1 });
});

router.put("/:id/restart", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await restartProject(id);
  return c.json({ status: 1 });
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
    return c.json({ status: 1 }, 201);
  },
);

router.delete(
  "/:id/members/:memberId",
  zValidator("param", IdParam.extend({ memberId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, memberId } = c.req.valid("param");
    await removeMemberFromProject(id, memberId);
    return c.json({ status: 1 });
  },
);

export default router;
