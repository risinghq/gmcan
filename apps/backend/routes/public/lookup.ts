import { Hono } from "hono";

import { getLookupData } from "../../services/ref.service.js";

const router = new Hono();

router.get("/", async (c) => {
  const data = await getLookupData();
  return c.json(data);
});

export default router;
