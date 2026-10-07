import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../../lib/contracts.js";
import { badRequest } from "../../../lib/errors/app-error.js";
import { escapeHtml } from "../../../lib/html.js";
import { institutionalAddress, type Mailer, resendMailer } from "../../../lib/mail.js";
import { validate } from "../../../lib/validate.js";
import {
  findMemberByResetToken,
  resetPasswordWithToken,
  sendPasswordReset,
} from "../../../services/password-reset.service.js";

export function createEmailRouter(mailer: Mailer = resendMailer) {
  const router = new Hono();

  router.post(
    "/contact",
    validate(
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

      await mailer.send({
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

      return c.json(okStatus());
    },
  );

  // The token reaches the member only by email. Lookup and delivery run after
  // the response, so registered and unknown addresses receive the same response.
  router.post("/password-reset/request", validate("json", z.object({ email: z.email() })), async (c) => {
    const { email } = c.req.valid("json");
    // Check configuration before lookup so an error cannot reveal registered addresses.
    mailer.assertConfigured();
    c.executionCtx.waitUntil(sendPasswordReset(email, (mail) => mailer.send(mail)));
    return c.json(okStatus());
  });

  router.post("/password-reset/verify", validate("json", z.object({ token: z.string().min(1) })), async (c) => {
    const { token } = c.req.valid("json");
    if (!(await findMemberByResetToken(token))) throw badRequest("Invalid or expired token");
    return c.json(okStatus());
  });

  router.post(
    "/password-reset/confirm",
    validate("json", z.object({ token: z.string().min(1), newPassword: z.string().min(8) })),
    async (c) => {
      const { token, newPassword } = c.req.valid("json");
      if (!(await resetPasswordWithToken(token, newPassword))) throw badRequest("Invalid or expired token");
      return c.json(okStatus());
    },
  );

  return router;
}
