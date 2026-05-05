import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { roleById } from "../../authz/permissions.js";
import { verifyPassword } from "../../lib/password.js";
import { capabilitiesForActor } from "../../middleware/authz.js";
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
  const role = roleById[member.roleId];
  const capabilities = role
    ? capabilitiesForActor({ id: member.id, roleId: member.roleId, role, status: member.status })
    : [];
  await createSession(c, member.id, email);
  return c.json({ user: { ...user, capabilities } });
});

router.post("/logout", async (c) => {
  await destroySession(c);
  return new Response(null, { status: 204, headers: { "Clear-Site-Data": '"cookies","storage"' } });
});

export default router;
