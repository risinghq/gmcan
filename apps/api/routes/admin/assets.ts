import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { badRequest } from "../../lib/errors/app-error.js";
import { extractFirstFile } from "../../lib/upload.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { deleteCurrentAsset, putAsset, restoreAsset } from "../../services/assets/service.js";
import type { OwnerType } from "../../services/assets/types.js";
import { CanonicalAssetPayloadSchema, assertSlotForOwner } from "../../services/assets/validators.js";

const router = new Hono();
const RestoreBody = z.object({ assetId: z.number().int().positive() });

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.put("/", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const parsed = CanonicalAssetPayloadSchema.safeParse({
    ownerType: body.ownerType,
    ownerId: body.ownerId,
    slot: body.slot,
  });
  if (!parsed.success) throw badRequest("Invalid request", parsed.error.issues);

  const file = extractFirstFile(body);
  if (!file) throw badRequest("No file uploaded");

  assertSlotForOwner(parsed.data.ownerType as OwnerType, parsed.data.slot);
  await putAsset({ ...parsed.data, slot: parsed.data.slot as never, file, actorId: c.get("memberId") });
  return c.json(okStatus());
});

router.delete("/", validate("json", CanonicalAssetPayloadSchema), async (c) => {
  const payload = c.req.valid("json");
  assertSlotForOwner(payload.ownerType as OwnerType, payload.slot);
  await deleteCurrentAsset({ ...payload, slot: payload.slot as never, actorId: c.get("memberId") });
  return c.json(okStatus());
});

router.post("/restore", validate("json", RestoreBody), async (c) => {
  const { assetId } = c.req.valid("json");
  await restoreAsset(assetId, c.get("memberId"));
  return c.json(okStatus());
});

export default router;
