import { Hono } from "hono";

import { listSoftware } from "../../services/group.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const rows = await listSoftware();
  return c.json(rows);
});

export default router;
