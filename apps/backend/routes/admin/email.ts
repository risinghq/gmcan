import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getMemberByEmail, updatePassword } from "../../services/member.service.js";

const router = new Hono();

router.put(
  "/member-password",
  zValidator("json", z.object({ email: z.email(), password: z.string().min(1) })),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const member = await getMemberByEmail(email);
    if (!member) return c.json({ error: "Not found" }, 404);
    await updatePassword(email, password);
    return c.json({ status: 1 });
  },
);

export default router;
