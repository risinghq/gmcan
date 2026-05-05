import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { Actor } from "../../authz/types.js";
import { okStatus } from "../../lib/contracts.js";
import { capabilitiesForActor, requirePermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import { getMemberFull, getResetPasswordStatus, updatePassword } from "../../services/member.service.js";

const router = new Hono();

router.get("/me", requirePermission("account.self.read"), async (c) => {
  const memberId = c.get("memberId") as number;
  const member = await getMemberFull(memberId);
  if (!member) return c.json({ error: "Not found" }, 404);
  const actor = c.get("actor") as Actor;
  return c.json({
    ...member,
    asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: member.id, slot: "photo" }),
    capabilities: capabilitiesForActor(actor),
  });
});

router.get("/reset-status", requirePermission("account.self.read"), async (c) => {
  const email = c.get("email") as string;
  const row = await getResetPasswordStatus(email);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ resetPassword: row.resetPassword });
});

router.put(
  "/password",
  requirePermission("account.self.write"),
  zValidator("json", z.object({ password: z.string().min(1) })),
  async (c) => {
    const { password } = c.req.valid("json");
    const email = c.get("email") as string;
    await updatePassword(email, password);
    return c.json(okStatus());
  },
);

export default router;
