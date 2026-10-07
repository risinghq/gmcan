import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "../../../services/assets/service.js";
import { getMethodLocalized, listMethodsLocalized } from "../../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => {
  const locale = c.get("locale");
  const rows = await listMethodsLocalized(locale);
  const assets = await resolveAssetAccessUrls({
    ownerType: "method",
    ownerIds: rows.map((row) => row.id),
    slot: "photo",
  });
  return c.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      asset: assets.get(row.id) ?? null,
      groupId: row.groupId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  );
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const row = await getMethodLocalized(id, locale);
  if (!row) throw notFound();
  return c.json({
    id: row.id,
    name: row.name,
    description: row.description,
    asset: await resolveAssetAccessUrl({ ownerType: "method", ownerId: row.id, slot: "photo" }),
    groupId: row.groupId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
});

export default router;
