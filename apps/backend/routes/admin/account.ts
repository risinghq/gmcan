import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { deleteUploadedFile, extractFirstFile, saveUploadedFile } from "../../lib/upload.js";
import {
  clearMemberPhoto,
  getMemberFull,
  getMemberPhoto,
  getResetPasswordStatus,
  setMemberPhoto,
  updatePassword,
} from "../../services/member.service.js";

const router = new Hono();
const MEMBER_FILE = { directory: "member", kind: "image" } as const;

router.get("/me", async (c) => {
  const memberId = c.get("memberId") as number;
  const member = await getMemberFull(memberId);
  if (!member) return c.json({ error: "Not found" }, 404);
  return c.json(member);
});

router.get("/reset-status", async (c) => {
  const email = c.get("email") as string;
  const row = await getResetPasswordStatus(email);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ resetPassword: row.resetPassword });
});

router.put("/password", zValidator("json", z.object({ email: z.email(), password: z.string().min(1) })), async (c) => {
  const { email, password } = c.req.valid("json");
  await updatePassword(email, password);
  return c.json({ status: 1 });
});

router.put("/photo", async (c) => {
  const memberId = c.get("memberId") as number;
  const current = await getMemberPhoto(memberId);
  if (!current) return c.json({ error: "Not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);
  const fileName = await saveUploadedFile(file, MEMBER_FILE);
  if (!fileName) return c.json({ error: "Invalid file type" }, 400);

  await setMemberPhoto(memberId, fileName);
  if (current.photo && current.photo !== fileName) {
    await deleteUploadedFile({ directory: MEMBER_FILE.directory, fileName: current.photo });
  }
  return c.json({ status: 1 });
});

router.delete("/photo", async (c) => {
  const memberId = c.get("memberId") as number;
  const row = await getMemberPhoto(memberId);
  if (!row?.photo) return c.json({ error: "File not found" }, 404);
  await deleteUploadedFile({ directory: MEMBER_FILE.directory, fileName: row.photo });
  await clearMemberPhoto(memberId);
  return c.json({ status: 1 });
});

export default router;
