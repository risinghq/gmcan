import { Hono } from "hono";
import { z } from "zod";

import { serveAsset } from "../../lib/upload.js";

const router = new Hono();
const Query = z.object({ download: z.coerce.boolean().optional() });

router.get("/:assetKey{.+}", async (c) => {
  const parsed = Query.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!parsed.success) return c.json({ error: "Invalid query" }, 400);
  return serveAsset(c, { assetKey: c.req.param("assetKey"), asAttachment: parsed.data.download });
});

export default router;
