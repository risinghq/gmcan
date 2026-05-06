import { Hono } from "hono";

import { requirePermission } from "../../middleware/authz.js";
import { getDashboardSummary } from "../../services/dashboard.service.js";

const router = new Hono();

router.get("/summary", requirePermission("analytics.read"), async (c) => {
  const locale = c.get("locale");
  return c.json(await getDashboardSummary(locale));
});

export default router;
