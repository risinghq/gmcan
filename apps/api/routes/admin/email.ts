import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { updatePassword, verifyEmailExists } from "../../services/member.service.js";

const router = new Hono();
router.use("*", requirePermission("content.write"));

router.put(
  "/member-password",
  validate("json", z.object({ email: z.email(), password: z.string().min(1) })),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const target = await verifyEmailExists(email);
    if (!target) throw notFound();
    // An administrator changing their own password keeps the session that did it.
    await updatePassword(target.id, password, target.id === c.get("memberId") ? getCookie(c, "sid") : undefined);
    return c.json(okStatus());
  },
);

export default router;
