import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getFrontendUrl } from "../../../config.js";
import { assertMailConfigured, institutionalAddress, sendMail } from "../../../lib/mail.js";
import {
  consumeResetToken,
  getMemberByEmail,
  getMemberByResetToken,
  setResetToken,
} from "../../../services/member.service.js";

const router = new Hono();

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

router.post(
  "/contact",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      reason: z.string().min(1),
      email: z.email(),
      phone: z.string().min(1),
    }),
  ),
  async (c) => {
    const { name, reason, email, phone } = c.req.valid("json");

    await sendMail({
      to: [institutionalAddress()],
      subject: `GMCAN Membership Request - ${name.replace(/[\r\n]+/g, " ")}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Membership Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Motivation:</strong></p>
        <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">${escapeHtml(reason)}</div>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      </div>
    `,
    });

    return c.json({ success: true });
  },
);

router.post("/password-reset/request", zValidator("json", z.object({ email: z.email() })), async (c) => {
  const { email } = c.req.valid("json");
  // Refuse before the lookup, or the answer would reveal which addresses are registered.
  assertMailConfigured();
  const member = await getMemberByEmail(email);

  if (!member) return c.json({ success: true });

  const token = randomToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await setResetToken(member.id, token, expires);

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  await sendMail({
    to: [email],
    subject: "Password Reset - GMCAN",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello <strong>${escapeHtml(member.firstName)}</strong>,</p>
        <p>Click the link below to reset your password. This link expires in 24 hours.</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });

  return c.json({ success: true });
});

router.post("/password-reset/verify", zValidator("json", z.object({ token: z.string().min(1) })), async (c) => {
  const { token } = c.req.valid("json");
  const member = await getMemberByResetToken(token);
  if (!member) return c.json({ error: "Invalid or expired token" }, 400);
  return c.json({ success: true, member: { name: member.firstName, email: member.email } });
});

router.post(
  "/password-reset/confirm",
  zValidator("json", z.object({ token: z.string().min(1), newPassword: z.string().min(8) })),
  async (c) => {
    const { token, newPassword } = c.req.valid("json");
    const member = await getMemberByResetToken(token);
    if (!member) return c.json({ error: "Invalid or expired token" }, 400);
    await consumeResetToken(member.id, newPassword);
    return c.json({ success: true });
  },
);

export default router;
