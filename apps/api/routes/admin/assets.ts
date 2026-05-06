import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { extractFirstFile } from "../../lib/upload.js";
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
  if (!parsed.success) return c.json({ error: "Invalid payload" }, 400);

  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  try {
    assertSlotForOwner(parsed.data.ownerType as OwnerType, parsed.data.slot);
    await putAsset({ ...parsed.data, slot: parsed.data.slot as never, file, actorId: c.get("memberId") });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Unsupported slot") || error.message.includes("Invalid"))) {
      return c.json({ error: error.message }, 400);
    }
    if (error instanceof Error && error.message === "Owner not found") return c.json({ error: error.message }, 404);
    throw error;
  }
  return c.json(okStatus());
});

router.delete("/", zValidator("json", CanonicalAssetPayloadSchema), async (c) => {
  const payload = c.req.valid("json");
  try {
    assertSlotForOwner(payload.ownerType as OwnerType, payload.slot);
    await deleteCurrentAsset({ ...payload, slot: payload.slot as never, actorId: c.get("memberId") });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) return c.json({ error: error.message }, 404);
    if (error instanceof Error && error.message.includes("Unsupported slot"))
      return c.json({ error: error.message }, 400);
    throw error;
  }
  return c.json(okStatus());
});

router.post("/restore", zValidator("json", RestoreBody), async (c) => {
  const { assetId } = c.req.valid("json");
  try {
    await restoreAsset(assetId, c.get("memberId"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) return c.json({ error: error.message }, 404);
    throw error;
  }
  return c.json(okStatus());
});

export default router;
