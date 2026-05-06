import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { resolveAssetAccessUrl } from "../../services/assets/service.js";
import { getResearchLineLocalized, listResearchLinesLocalized } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listResearchLinesLocalized(locale);
  const shaped = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      asset: await resolveAssetAccessUrl({ ownerType: "research_line", ownerId: row.id, slot: "photo" }),
      groupId: row.groupId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
  return c.json(shaped);
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getResearchLineLocalized(id, locale);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    name: row.name,
    description: row.description,
    asset: await resolveAssetAccessUrl({ ownerType: "research_line", ownerId: row.id, slot: "photo" }),
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

export default router;
