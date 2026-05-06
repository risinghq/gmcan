import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { requirePermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import {
  addMemberToGroup,
  createMember,
  deleteMember,
  getMemberFull,
  listAdminMembers,
  listMemberGroups,
  removeMemberFromGroup,
  searchAuthorPool,
  updateMember,
  verifyEmailExists,
} from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const CreateBody = z.object({
  dni: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  maternalName: z.string().optional(),
  birthDate: z.string().optional(),
  bio: z.string().optional(),
  status: z.number().int(),
  roleId: z.number().int(),
  memberTypeId: z.number().int(),
  prefixId: z.number().int().optional(),
  genderId: z.number().int().optional(),
});

const UpdateBody = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  maternalName: z.string().optional(),
  birthDate: z.string().optional(),
  bio: z.string().optional(),
  status: z.number().int(),
  roleId: z.number().int(),
  memberTypeId: z.number().int(),
  prefixId: z.number().int().optional(),
  genderId: z.number().int().optional(),
});

const FilterQuery = z.object({
  q: z.string().optional(),
  status: z.coerce.number().int().optional(),
  memberTypeId: z.coerce.number().int().optional(),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("members.read")(c, next);
  return requirePermission("members.write")(c, next);
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { q, status, memberTypeId } = c.req.valid("query");
  return c.json(await listAdminMembers({ q, status, memberTypeId }));
});

router.get("/exists/email", zValidator("query", z.object({ email: z.string().min(1) })), async (c) => {
  const { email } = c.req.valid("query");
  const found = await verifyEmailExists(email);
  return c.json({ exists: !!found });
});

router.get("/authors/search", zValidator("query", z.object({ q: z.string().default("") })), async (c) => {
  const { q } = c.req.valid("query");
  const results = await searchAuthorPool(q);
  return c.json(results);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const member = await getMemberFull(id);
  if (!member) return c.json({ error: "Not found" }, 404);
  return c.json({
    ...member,
    asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: member.id, slot: "photo" }),
  });
});

router.post("/", zValidator("json", CreateBody), async (c) => {
  const data = c.req.valid("json");
  const id = await createMember(data);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await updateMember(id, data);
  return c.json(okStatus());
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMember(id);
  return c.json(okStatus());
});

router.get("/:id/groups", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listMemberGroups(id);
  return c.json(rows);
});

router.post(
  "/:id/groups",
  zValidator("param", IdParam),
  zValidator("json", z.object({ groupId: z.number().int() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { groupId } = c.req.valid("json");
    await addMemberToGroup(id, groupId);
    return c.json(okStatus(), 201);
  },
);

router.delete(
  "/:id/groups/:groupId",
  zValidator("param", IdParam.extend({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, groupId } = c.req.valid("param");
    await removeMemberFromGroup(id, groupId);
    return c.json(okStatus());
  },
);

export default router;
