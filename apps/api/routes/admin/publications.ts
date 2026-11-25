import {
  type AdminPublication,
  AdminPublicationListQuerySchema,
  PublicationTranslationSchema,
  PublicationWriteFieldsSchema,
} from "@gmcan/contracts/admin";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { okStatus } from "../../lib/contracts.js";
import { notFound } from "../../lib/errors/app-error.js";
import { validate } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createPublication,
  deletePublication,
  getAdminPublication,
  listAdminPublications,
  updatePublication,
} from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const PublicationBody = PublicationWriteFieldsSchema.extend({
  translations: translationsSchema(PublicationTranslationSchema.shape),
});

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("publications.read")(c, next);
  return requirePermission("publications.write")(c, next);
});

router.get("/", validate("query", AdminPublicationListQuerySchema), async (c) => {
  const locale = c.get("locale");
  const filters = c.req.valid("query");
  return c.json(await listAdminPublications(filters, locale));
});

router.get("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const publication = await getAdminPublication(id);
  if (!publication) throw notFound();
  return c.json(publication satisfies AdminPublication);
});

router.post("/", validate("json", PublicationBody), async (c) => {
  const id = await createPublication(c.req.valid("json"));
  return c.json({ id }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", PublicationBody), async (c) => {
  const { id } = c.req.valid("param");
  await updatePublication(id, c.req.valid("json"));
  return c.json(okStatus());
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deletePublication(id);
  return c.json(okStatus());
});

export default router;
