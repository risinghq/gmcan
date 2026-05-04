import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { Actor } from "../../authz/types.js";
import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import { capabilitiesForActor, requirePermission } from "../../middleware/authz.js";
import {
  clearMemberPhoto,
  getMemberFull,
  getMemberPhoto,
  getResetPasswordStatus,
  setMemberPhoto,
  updatePassword,
} from "../../services/member.service.js";

const router = new Hono();

router.get("/me", requirePermission("account.self.read"), async (c) => {
  const memberId = c.get("memberId") as number;
  const member = await getMemberFull(memberId);
  if (!member) return c.json({ error: "Not found" }, 404);
  const actor = c.get("actor") as Actor;
  return c.json({ ...member, capabilities: capabilitiesForActor(actor) });
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
    return c.json({ status: 1 });
  },
);

router.put("/asset", requirePermission("account.self.write"), async (c) => {
  const memberId = c.get("memberId") as number;
  const current = await getMemberPhoto(memberId);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, { domain: "members", kind: "image" });
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setMemberPhoto(memberId, fileName);
  if (current.photo && current.photo !== fileName) {
    await deleteUploadedFile({ assetKey: current.photo });
  }
  return c.json({ status: 1 });
});

router.delete("/asset", requirePermission("account.self.write"), async (c) => {
  const memberId = c.get("memberId") as number;
  const row = await getMemberPhoto(memberId);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  await deleteUploadedFile({ assetKey: row.photo });
  await clearMemberPhoto(memberId);
  return c.json({ status: 1 });
});

export default router;
