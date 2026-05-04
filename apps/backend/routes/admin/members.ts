import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  addMemberToGroup,
  clearMemberPhoto,
  createMember,
  deleteMember,
  getMemberFull,
  getMemberPhoto,
  listActiveMembers,
  listMemberGroups,
  listMemberNames,
  listMembers,
  listMembersByType,
  removeMemberFromGroup,
  searchMembers,
  searchAuthorPool,
  setMemberPhoto,
  updateMember,
  verifyDniExists,
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
  bioEN: z.string().optional(),
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
  bioEN: z.string().optional(),
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
  email: z.string().optional(),
  dni: z.string().optional(),
  names: z.coerce.boolean().optional(),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("members.read")(c, next);
  return requirePermission("members.write")(c, next);
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const { q, status, memberTypeId, email, dni, names } = c.req.valid("query");
  if (q) return c.json(await searchMembers(q));
  if (email) return c.json(await verifyEmailExists(email));
  if (dni) return c.json(await verifyDniExists(dni));
  if (status !== undefined) return c.json(await listActiveMembers(status));
  if (memberTypeId !== undefined) return c.json(await listMembersByType(memberTypeId));
  if (names) return c.json(await listMemberNames());
  return c.json(await listMembers());
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
  return c.json(member);
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
  return c.json({ status: 1 });
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMember(id);
  return c.json({ status: 1 });
});

router.put("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const current = await getMemberPhoto(id);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, { domain: "members", kind: "image" });
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setMemberPhoto(id, fileName);
  if (current.photo && current.photo !== fileName) {
    await deleteUploadedFile({ assetKey: current.photo });
  }
  return c.json({ status: 1 });
});

router.delete("/:id/photo", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getMemberPhoto(id);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  await deleteUploadedFile({ assetKey: row.photo });
  await clearMemberPhoto(id);
  return c.json({ status: 1 });
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
    return c.json({ status: 1 }, 201);
  },
);

router.delete(
  "/:id/groups/:groupId",
  zValidator("param", IdParam.extend({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, groupId } = c.req.valid("param");
    await removeMemberFromGroup(id, groupId);
    return c.json({ status: 1 });
  },
);

export default router;
