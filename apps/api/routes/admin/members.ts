import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { LocaleCodeSchema } from "../../lib/locales.js";
import { requirePermission, requireSelfOrPermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl } from "../../services/assets/service.js";
import {
  addMemberToGroup,
  createMember,
  deleteMember,
  getMemberPublishability,
  getMemberTranslation,
  getMemberFull,
  listAdminMembers,
  listMemberGroups,
  removeMemberFromGroup,
  searchAuthorPool,
  updateMember,
  updateMemberTranslation,
  verifyEmailExists,
} from "../../services/member.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const RoleCode = z.enum(["administrator", "researcher", "visitor"]);
const MemberTypeCode = z.enum(["researcher", "phd_student", "master_student", "undergraduate_student", "collaborator"]);
const PrefixCode = z.enum(["dr", "dra", "mg", "lic", "bach", "ing", "none"]);
const GenderCode = z.enum(["male", "female"]);

const CreateBody = z.object({
  dni: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  maternalName: z.string().optional(),
  birthDate: z.string().optional(),
  isActive: z.number().int(),
  roleCode: RoleCode,
  memberTypeCode: MemberTypeCode,
  prefixCode: PrefixCode.nullish(),
  genderCode: GenderCode.nullish(),
  translation: z.object({ locale: LocaleCodeSchema, bio: z.string() }).optional(),
});

const UpdateBody = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  maternalName: z.string().optional(),
  birthDate: z.string().optional(),
  isActive: z.number().int(),
  roleCode: RoleCode,
  memberTypeCode: MemberTypeCode,
  prefixCode: PrefixCode.nullish(),
  genderCode: GenderCode.nullish(),
  translation: z.object({ locale: LocaleCodeSchema, bio: z.string() }).optional(),
});

const FilterQuery = z.object({
  q: z.string().optional(),
  isActive: z.coerce.number().int().optional(),
  memberTypeCode: MemberTypeCode.optional(),
});

router.get("/", requirePermission("members.read"), zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { q, isActive, memberTypeCode } = c.req.valid("query");
  return c.json(await listAdminMembers(locale, { q, isActive, memberTypeCode }));
});

router.get(
  "/exists/email",
  requirePermission("members.read"),
  zValidator("query", z.object({ email: z.string().min(1) })),
  async (c) => {
    const { email } = c.req.valid("query");
    const found = await verifyEmailExists(email);
    return c.json({ exists: !!found });
  },
);

router.get(
  "/authors/search",
  requirePermission("members.read"),
  zValidator("query", z.object({ q: z.string().default("") })),
  async (c) => {
    const { q } = c.req.valid("query");
    const results = await searchAuthorPool(q);
    return c.json(results);
  },
);

router.get("/:id", requirePermission("members.read"), zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const member = await getMemberFull(id, locale);
  if (!member) return c.json({ error: "Not found" }, 404);
  return c.json({
    ...member,
    asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: member.id, slot: "photo" }),
  });
});

router.get("/:id/publishability", requirePermission("members.read"), zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const publishability = await getMemberPublishability(id);
  return c.json(publishability);
});

router.post("/", requirePermission("members.write"), zValidator("json", CreateBody), async (c) => {
  const data = c.req.valid("json");
  const id = await createMember(data);
  return c.json({ id }, 201);
});

router.patch(
  "/:id",
  requirePermission("members.write"),
  zValidator("param", IdParam),
  zValidator("json", UpdateBody.partial()),
  async (c) => {
    const locale = c.get("locale");
    const { id } = c.req.valid("param");
    const patch = c.req.valid("json");
    const current = await getMemberFull(id, locale);
    if (!current) return c.json({ error: "Not found" }, 404);
    await updateMember(id, {
      email: patch.email ?? current.email,
      firstName: patch.firstName ?? current.firstName,
      lastName: patch.lastName ?? current.lastName,
      maternalName: patch.maternalName !== undefined ? patch.maternalName : (current.maternalName ?? undefined),
      birthDate: patch.birthDate !== undefined ? patch.birthDate : (current.birthDate ?? undefined),
      isActive: patch.isActive ?? current.isActive,
      roleCode: patch.roleCode ?? current.roleCode,
      memberTypeCode: patch.memberTypeCode ?? current.memberTypeCode,
      prefixCode: patch.prefixCode !== undefined ? patch.prefixCode : (current.prefixCode ?? undefined),
      genderCode: patch.genderCode !== undefined ? patch.genderCode : (current.genderCode ?? undefined),
      translation: patch.translation,
    });
    return c.json(okStatus());
  },
);

router.put(
  "/:id/translations/:locale",
  requireSelfOrPermission({
    resourceParam: "id",
    selfPermission: "account.self.write",
    elevatedPermission: "members.write",
  }),
  zValidator("param", IdParam.extend({ locale: LocaleCodeSchema })),
  zValidator("json", z.object({ bio: z.string() })),
  async (c) => {
    const { id, locale } = c.req.valid("param");
    const { bio } = c.req.valid("json");
    await updateMemberTranslation(id, locale, bio);
    return c.json(okStatus());
  },
);

router.get(
  "/:id/translations/:locale",
  requireSelfOrPermission({
    resourceParam: "id",
    selfPermission: "account.self.read",
    elevatedPermission: "members.read",
  }),
  zValidator("param", IdParam.extend({ locale: LocaleCodeSchema })),
  async (c) => {
    const { id, locale } = c.req.valid("param");
    const row = await getMemberTranslation(id, locale);
    return c.json({ bio: row?.bio ?? "" });
  },
);

router.delete("/:id", requirePermission("members.write"), zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMember(id);
  return c.json(okStatus());
});

router.get("/:id/groups", requirePermission("members.read"), zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const rows = await listMemberGroups(id);
  return c.json(rows);
});

router.post(
  "/:id/groups",
  requirePermission("members.write"),
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
  requirePermission("members.write"),
  zValidator("param", IdParam.extend({ groupId: z.coerce.number().int().positive() })),
  async (c) => {
    const { id, groupId } = c.req.valid("param");
    await removeMemberFromGroup(id, groupId);
    return c.json(okStatus());
  },
);

export default router;
