import { MemberAdminFieldsSchema, MemberCreateFieldsSchema, MemberTranslationSchema } from "@gmcan/contracts/admin";
import { MemberTypeCodeSchema } from "@gmcan/contracts/public";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  addMemberToGroup,
  createMember,
  deleteMember,
  getAdminMember,
  getMemberPublishability,
  listAdminMembers,
  listMemberGroups,
  memberExists,
  removeMemberFromGroup,
  searchAuthorPool,
  updateMember,
  verifyEmailExists,
} from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const translations = translationsSchema(MemberTranslationSchema.shape);
const MemberBody = MemberAdminFieldsSchema.extend({ translations });
const MemberCreateBody = MemberCreateFieldsSchema.extend({ translations });

const FilterQuery = z.object({
  q: z.string().optional(),
  isActive: z.coerce
    .number()
    .pipe(z.union([z.literal(0), z.literal(1)]))
    .optional(),
  memberTypeCode: MemberTypeCodeSchema.optional(),
});

router.get("/", requirePermission("members.read"), validate("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { q, isActive, memberTypeCode } = c.req.valid("query");
  return c.json(await listAdminMembers(locale, { q, isActive, memberTypeCode }));
});

router.get(
  "/exists/email",
  requirePermission("members.read"),
  validate("query", z.object({ email: z.string().min(1) })),
  async (c) => {
    const { email } = c.req.valid("query");
    const found = await verifyEmailExists(email);
    return c.json({ exists: !!found });
  },
);

router.get(
  "/authors/search",
  requirePermission("members.read"),
  validate("query", z.object({ q: z.string().default("") })),
  async (c) => {
    const { q } = c.req.valid("query");
    const results = await searchAuthorPool(q, c.get("locale"));
    return c.json(results);
  },
);

router.get("/:id", requirePermission("members.read"), validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const member = await getAdminMember(id, c.get("locale"));
  if (!member) throw notFound();
  return c.json(member);
});

router.get("/:id/publishability", requirePermission("members.read"), validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const publishability = await getMemberPublishability(id);
  return c.json(publishability);
});

router.post("/", requirePermission("members.write"), validate("json", MemberCreateBody), async (c) => {
  const id = await createMember(c.req.valid("json"));
  return c.json({ id }, 201);
});

router.put(
  "/:id",
  requirePermission("members.write"),
  validate("param", IdParam),
  validate("json", MemberBody),
  async (c) => {
    const { id } = c.req.valid("param");
    if (!(await memberExists(id))) throw notFound();
    await updateMember(id, c.req.valid("json"));
    return c.json(okStatus());
  },
);

router.delete("/:id", requirePermission("members.write"), validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMember(id);
  return c.json(okStatus());
});

router.get("/:id/groups", requirePermission("members.read"), validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listMemberGroups(id);
  return c.json(rows);
});

router.post(
  "/:id/groups",
  requirePermission("members.write"),
  validate("param", IdParam),
  validate("json", z.object({ groupId: z.number().int() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const { groupId } = c.req.valid("json");
    await addMemberToGroup(id, groupId);
    return c.json(okStatus(), 201);
  },
);

router.delete(
  "/:id/groups/:groupId",
  requirePermission("members.write"),
  validate("param", IdParam.extend({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, groupId } = c.req.valid("param");
    await removeMemberFromGroup(id, groupId);
    return c.json(okStatus());
  },
);

export default router;
