import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { resolveAssetAccessUrl } from "../../../services/assets/service.js";
import { getMethodLocalized, listPublicMethods } from "../../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

router.get("/", async (c) => c.json(await listPublicMethods(c.get("locale"))));

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
