import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "../../services/assets/service.js";
import {
  createMethod,
  deleteMethod,
  getMethod,
  listMethods,
  toAdminMethodViews,
  updateMethod,
} from "../../services/group.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const Body = z.object({
  groupId: z.number().int(),
  translations: translationsSchema({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
});

const UpdateBody = z.object({
  translations: translationsSchema({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("content.read")(c, next);
  return requirePermission("content.write")(c, next);
});

router.get("/", async (c) => {
  const rows = await listMethods();
  const [views, assets] = await Promise.all([
    toAdminMethodViews(rows),
    resolveAssetAccessUrls({ ownerType: "method", ownerIds: rows.map((row) => row.id), slot: "photo" }),
  ]);
  return c.json(views.map((view) => Object.assign({}, view, { asset: assets.get(view.id) ?? null })));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const row = await getMethod(id);
  if (!row) throw notFound();
  const [view] = await toAdminMethodViews([row]);
  if (!view) throw notFound();
  return c.json(
    Object.assign({}, view, {
      asset: await resolveAssetAccessUrl({ ownerType: "method", ownerId: view.id, slot: "photo" }),
    }),
  );
});

router.post("/", validate("json", Body), async (c) => {
  const data = c.req.valid("json");
  const id = await createMethod(data);
  return c.json({ id }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  await updateMethod(id, data);
  return c.json(okStatus());
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deleteMethod(id);
  return c.json(okStatus());
});

export default router;
