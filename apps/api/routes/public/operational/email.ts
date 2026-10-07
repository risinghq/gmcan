import crypto from "node:crypto";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Resend } from "resend";
import { z } from "zod";

import { getFrontendUrl } from "../../../config.js";
import { env } from "../../../config/env.js";
import {
  consumeResetToken,
  getMemberByEmail,
  getMemberByResetToken,
  setResetToken,
} from "../../../services/member.service.js";

const router = new Hono();
const resend = new Resend(env.RESEND_API_KEY);

function getEmailConfig() {
  const isDev = env.NODE_ENV === "development";
  return {
    from: isDev ? "Development <onboarding@resend.dev>" : "GMCAN <gmcan@unmsm.edu.pe>",
    institutionalTo: isDev ? "delivered@resend.dev" : env.INSTITUTIONAL_EMAIL,
  };
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
    const { from, institutionalTo } = getEmailConfig();

    const result = await resend.emails.send({
      from,
      to: [institutionalTo],
      subject: `GMCAN Membership Request - ${name}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Membership Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Motivation:</strong></p>
        <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">${reason}</div>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone}</p>
      </div>
    `,
    });

    return c.json({ success: true, emailId: result.data?.id });
  },
);

router.post("/password-reset/request", zValidator("json", z.object({ email: z.email() })), async (c) => {
  const { email } = c.req.valid("json");
  const member = await getMemberByEmail(email);

  if (!member) return c.json({ success: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await setResetToken(member.id, token, expires);

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;
  const { from } = getEmailConfig();

  await resend.emails.send({
    from,
    to: [email],
    subject: "Password Reset - GMCAN",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello <strong>${member.firstName}</strong>,</p>
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
