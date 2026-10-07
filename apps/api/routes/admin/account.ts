import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { getAccountView } from "../../services/account.service.js";
import { updatePassword } from "../../services/member.service.js";

const router = new Hono();

router.get("/me", requirePermission("account.self.read"), async (c) => {
  const view = await getAccountView(c.get("memberId"), c.get("locale"));
  if (!view) throw notFound();
  return c.json(view);
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
