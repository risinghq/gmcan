import { Hono } from "hono";
import { z } from "zod";

import { validate } from "../../../lib/validate.js";
import { serveAssetById } from "../../../services/assets/service.js";

const router = new Hono();
const Params = z.object({ assetId: z.coerce.number().int().positive() });
const Query = z.object({
  token: z.string().optional(),
  expires: z.coerce.number().int().optional(),
});

router.get("/:assetId/download", validate("param", Params), validate("query", Query), async (c) => {
  const { assetId } = c.req.valid("param");
  const parsed = c.req.valid("query");
  return serveAssetById(c, assetId, { ...parsed, asAttachment: true });
});

router.get("/:assetId", validate("param", Params), validate("query", Query), async (c) => {
  const { assetId } = c.req.valid("param");
  const parsed = c.req.valid("query");
  return serveAssetById(c, assetId, { ...parsed, asAttachment: false });
});

export default router;
