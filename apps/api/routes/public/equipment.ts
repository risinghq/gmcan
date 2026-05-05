import { Hono } from "hono";

import { listEquipment } from "../../services/group.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const rows = await listEquipment();
  return c.json(rows);
});

export default router;
