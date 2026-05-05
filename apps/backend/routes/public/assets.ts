import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveAssetById } from "../../services/asset.service.js";

const router = new Hono();
const Params = z.object({ assetId: z.coerce.number().int().positive() });
const Query = z.object({
  download: z.coerce.boolean().optional(),
  token: z.string().optional(),
  expires: z.coerce.number().int().optional(),
});

router.get("/:assetId", zValidator("param", Params), async (c) => {
  const { assetId } = c.req.valid("param");
  const parsed = Query.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!parsed.success) return c.json({ error: "Invalid query" }, 400);
  return serveAssetById(c, assetId, parsed.data);
});

export default router;
