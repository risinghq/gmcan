import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { localizeField } from "../../lib/public-locale.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import { getMethod, listMethods } from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMethods();
  const shaped = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: localizeField(row, locale, { es: "name", en: "nameEN" }),
      description: localizeField(row, locale, { es: "description", en: "descriptionEN" }),
      asset: await resolveAssetAccessUrl({ resourceType: "method", resourceId: row.id, slot: "photo" }),
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
  const row = await getMethod(id);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: row.id,
    name: localizeField(row, locale, { es: "name", en: "nameEN" }),
    description: localizeField(row, locale, { es: "description", en: "descriptionEN" }),
    asset: await resolveAssetAccessUrl({ resourceType: "method", resourceId: row.id, slot: "photo" }),
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

export default router;
