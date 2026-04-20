import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { verifyPassword } from "../../lib/password.js";
import { createSession, destroySession } from "../../middleware/session.js";
import { getMemberByEmail } from "../../services/member.service.js";

const router = new Hono();

router.post("/login", zValidator("json", z.object({ email: z.email(), password: z.string().min(1) })), async (c) => {
  const { email, password } = c.req.valid("json");
  const member = await getMemberByEmail(email);

  if (!member) return c.json({ error: "Invalid credentials" }, 401);

  const match = await verifyPassword(password, member.password);
  if (!match) return c.json({ error: "Invalid credentials" }, 401);

  const { password: _pw, ...user } = member;
  await createSession(c, member.id, email);
  return c.json({ user });
});

router.post("/logout", async (c) => {
  await destroySession(c);
  return new Response(null, { status: 204 });
});

export default router;
