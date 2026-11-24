import { AssetTargetSchema } from "@gmcan/contracts/admin";
import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { badRequest } from "../../lib/errors/app-error.js";
import { extractFirstFile } from "../../lib/upload.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { deleteCurrentAsset, putAsset, restoreAsset } from "../../services/assets/service.js";

const router = new Hono();
const RestoreBody = z.object({ assetId: z.number().int().positive() });

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.put("/", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const parsed = AssetTargetSchema.safeParse({
    ownerType: body.ownerType,
    ownerId: body.ownerId,
    slot: body.slot,
  });
  if (!parsed.success) throw badRequest("Invalid request", parsed.error.issues);

  const file = extractFirstFile(body);
  if (!file) throw badRequest("No file uploaded");

  await putAsset({ ...parsed.data, file, actorId: c.get("memberId") });
  return c.json(okStatus());
});

router.delete("/", validate("json", AssetTargetSchema), async (c) => {
  await deleteCurrentAsset({ ...c.req.valid("json"), actorId: c.get("memberId") });
  return c.json(okStatus());
});

router.post("/restore", validate("json", RestoreBody), async (c) => {
  const { assetId } = c.req.valid("json");
  await restoreAsset(assetId, c.get("memberId"));
  return c.json(okStatus());
});

export default router;
