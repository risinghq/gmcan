import { Hono } from "hono";
import { z } from "zod";

import { unauthorized } from "../../lib/errors/app-error.js";
import { verifyPassword } from "../../lib/password.js";
import { validate } from "../../lib/validate.js";
import { createSession, destroySession } from "../../middleware/session.js";
import { getAccountView } from "../../services/account.service.js";
import { getMemberByEmail } from "../../services/member.service.js";

const router = new Hono();

router.post("/login", validate("json", z.object({ email: z.email(), password: z.string().min(1) })), async (c) => {
  const { email, password } = c.req.valid("json");
  const member = await getMemberByEmail(email);

  if (!member || member.isActive !== 1) throw unauthorized("Invalid credentials");
  if (!(await verifyPassword(password, member.passwordHash))) throw unauthorized("Invalid credentials");

  await createSession(c, member.id);
  const user = await getAccountView(member.id, c.get("locale"));
  return c.json({ user });
});

router.post("/logout", async (c) => {
  await destroySession(c);
  return new Response(null, { status: 204, headers: { "Clear-Site-Data": '"cookies","storage"' } });
});

export default router;
