import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { translationsSchema } from "../../lib/admin-translations.js";
import { replaceAssetFile } from "../../lib/asset-route.js";
import { okStatus } from "../../lib/contracts.js";
import { requirePermission } from "../../middleware/authz.js";
import {
  createPublication,
  deletePublication,
  getPublicationEditView,
  getPublicationFile,
  listAdminPublications,
  replaceAuthors,
  setPublicationFile,
  updatePublication,
} from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const ListQuery = z.object({ type: z.coerce.number().int().optional() });

const AuthorEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), memberId: z.number().int(), isPrincipal: z.number().int() }),
  z.object({ kind: z.literal("external"), externalName: z.string().min(1), isPrincipal: z.number().int() }),
]);

const PublicationFields = z.object({
  doi: z.string().optional(),
  publishedAt: z.string(),
  journalIssue: z.number().optional(),
  typeId: z.number().int(),
  journalId: z.number().int().optional(),
  universityId: z.number().int().optional(),
  thesisTypeId: z.number().int().optional(),
  eventId: z.number().int().optional(),
  translations: translationsSchema({
    title: z.string().min(1),
    abstract: z.string().optional(),
  }),
});

const CreateBody = z.object({ data: PublicationFields, authors: z.array(AuthorEntry) });
const UpdateBody = z.object({ data: PublicationFields, authors: z.array(AuthorEntry) });

router.use("*", async (c, next) => {
  if (c.req.method === "GET") return requirePermission("publications.read")(c, next);
  return requirePermission("publications.write")(c, next);
});

router.get("/", zValidator("query", ListQuery), async (c) => {
  const { type } = c.req.valid("query");
  return c.json(await listAdminPublications(type));
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  const result = await getPublicationEditView(id);
  if (!result.publication) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", zValidator("json", CreateBody), async (c) => {
  const { data, authors } = c.req.valid("json");
  const id = await createPublication(data, authors);
  return c.json({ id }, 201);
});

router.put("/:id", zValidator("param", IdParam), zValidator("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const { data, authors } = c.req.valid("json");
  await updatePublication(id, data, authors);
  return c.json(okStatus());
});

router.delete("/:id", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deletePublication(id);
  return c.json(okStatus());
});

router.put("/:id/asset", zValidator("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  return replaceAssetFile(c, {
    domain: "publications",
    kind: "document",
    current: await getPublicationFile(id),
    column: "file",
    set: (assetKey) => setPublicationFile(id, assetKey),
  });
});

router.put("/:id/authors", zValidator("param", IdParam), zValidator("json", z.array(AuthorEntry)), async (c) => {
  const { id } = c.req.valid("param");
  const authors = c.req.valid("json");
  await replaceAuthors(id, authors);
  return c.json(okStatus());
});

export default router;
