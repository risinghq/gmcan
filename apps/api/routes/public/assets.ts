import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { serveAssetById } from "../../services/assets/service.js";

const router = new Hono();
const Params = z.object({ assetId: z.coerce.number().int().positive() });
const Query = z.object({
  download: z.coerce.boolean().optional(),
  token: z.string().optional(),
  expires: z.coerce.number().int().optional(),
});

router.get("/:assetId", zValidator("param", Params), zValidator("query", Query), async (c) => {
  const { assetId } = c.req.valid("param");
  const parsed = c.req.valid("query");
  return serveAssetById(c, assetId, parsed);
});

export default router;
