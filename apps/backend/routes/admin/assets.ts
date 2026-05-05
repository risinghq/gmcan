import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { okStatus } from "../../lib/contracts.js";
import { extractFirstFile } from "../../lib/upload.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  restoreBinding,
  softDeleteCurrentBinding,
  type ResourceType,
  uploadAndReplaceCurrent,
} from "../../services/asset.service.js";

const router = new Hono();

const ResourceParam = z.object({
  resourceType: z.enum(["member", "news", "method", "research_line", "publication", "research_group", "about"]),
  resourceId: z.coerce.number().int().positive(),
  slot: z.string().min(1),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.put("/:resourceType/:resourceId/:slot", zValidator("param", ResourceParam), async (c) => {
  const { resourceType, resourceId, slot } = c.req.valid("param");
  const body = await c.req.parseBody({ all: true });
  const file = extractFirstFile(body);
  if (!file) return c.json({ error: "No file uploaded" }, 400);

  try {
    await uploadAndReplaceCurrent({
      resourceType: resourceType as ResourceType,
      resourceId,
      slot,
      file,
      actorId: c.get("memberId") as number,
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Unsupported slot") || error.message.includes("Invalid"))) {
      return c.json({ error: error.message }, 400);
    }
    if (error instanceof Error && error.message === "Resource not found") return c.json({ error: error.message }, 404);
    throw error;
  }
  return c.json(okStatus());
});

router.delete("/:resourceType/:resourceId/:slot", zValidator("param", ResourceParam), async (c) => {
  const { resourceType, resourceId, slot } = c.req.valid("param");
  try {
    await softDeleteCurrentBinding({
      resourceType: resourceType as ResourceType,
      resourceId,
      slot,
      actorId: c.get("memberId") as number,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) return c.json({ error: error.message }, 404);
    throw error;
  }
  return c.json(okStatus());
});

router.post(
  "/restore/:bindingId",
  zValidator("param", z.object({ bindingId: z.coerce.number().int().positive() })),
  async (c) => {
    const { bindingId } = c.req.valid("param");
    try {
      await restoreBinding(bindingId, c.get("memberId") as number);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) return c.json({ error: error.message }, 404);
      throw error;
    }
    return c.json(okStatus());
  },
);

export default router;
