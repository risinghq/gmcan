import { Hono } from "hono";

import { requirePermission } from "../../middleware/authz.js";
import BasicRefRoutes from "./ref-basic.js";
import TranslatedRefRoutes from "./ref-translated.js";

const router = new Hono();

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("refs.read")(c, next);
  return requirePermission("refs.write")(c, next);
});

router.route("/", BasicRefRoutes);
router.route("/", TranslatedRefRoutes);

export default router;
