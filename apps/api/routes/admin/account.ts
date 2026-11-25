import { MemberProfileFieldsSchema, MemberTranslationSchema } from "@gmcan/contracts/admin";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { badRequest, notFound } from "../../lib/errors/app-error.js";
import { extractFirstFile } from "../../lib/upload.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { getAccountView } from "../../services/account.service.js";
import { putAsset } from "../../services/assets/service.js";
import {
  getAdminMember,
  getMemberPublishability,
  updateMemberProfile,
  updatePassword,
} from "../../services/member.service.js";

const router = new Hono();
const ProfileBody = MemberProfileFieldsSchema.extend({
  translations: translationsSchema(MemberTranslationSchema.shape),
});

router.get("/me", requirePermission("account.self.read"), async (c) => {
  const view = await getAccountView(c.get("memberId"), c.get("locale"));
  if (!view) throw notFound();
  return c.json(view);
});

router.get("/profile", requirePermission("account.self.read"), async (c) => {
  const member = await getAdminMember(c.get("memberId"), c.get("locale"));
  if (!member) throw notFound();
  return c.json(member);
});

router.get("/profile/publishability", requirePermission("account.self.read"), async (c) => {
  return c.json(await getMemberPublishability(c.get("memberId")));
});

router.put("/profile", requirePermission("account.self.write"), validate("json", ProfileBody), async (c) => {
  await updateMemberProfile(c.get("memberId"), c.req.valid("json"));
  return c.json(okStatus());
});

router.put("/profile/photo", requirePermission("account.self.write"), async (c) => {
  const file = extractFirstFile(await c.req.parseBody({ all: true }));
  if (!file) throw badRequest("No file uploaded");

  const memberId = c.get("memberId");
  await putAsset({ ownerType: "member", ownerId: memberId, slot: "photo", file, actorId: memberId });
  return c.json(okStatus());
});

router.put(
  "/password",
  requirePermission("account.self.write"),
  validate("json", z.object({ password: z.string().min(1) })),
  async (c) => {
    const { password } = c.req.valid("json");
    await updatePassword(c.get("memberId"), password, getCookie(c, "sid"));
    return c.json(okStatus());
  },
);

export default router;
