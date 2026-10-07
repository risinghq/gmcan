import { AdminPublicationListQuerySchema } from "@gmcan/contracts/admin";
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
  getPublicationEditView,
  listAdminPublications,
  replaceAuthors,
  updatePublication,
  type AuthorInput,
  type PublicationFields,
} from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });

const AuthorEntry = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("registered"), memberId: z.number().int(), authorOrder: z.number().int().min(1) }),
  z.object({ kind: z.literal("external"), externalName: z.string().min(1), authorOrder: z.number().int().min(1) }),
]);

const Subtype = z.discriminatedUnion("kindCode", [
  z.object({
    kindCode: z.literal("journal_article"),
    journalArticle: z.object({
      journalId: z.number().int().positive().optional(),
      issue: z.number().int().positive().optional(),
    }),
  }),
  z.object({
    kindCode: z.literal("conference_paper"),
    conferencePaper: z.object({ eventId: z.number().int().positive() }),
  }),
  z.object({
    kindCode: z.literal("thesis"),
    thesis: z.object({ universityId: z.number().int().positive(), thesisKindCode: z.enum(["phd", "masters"]) }),
  }),
]);

const PublicationFieldsSchema = z.object({
  doi: z.string().optional(),
  publishedAt: z.string(),
  subtype: Subtype,
  translations: translationsSchema({
    title: z.string().min(1),
    abstract: z.string().optional(),
  }),
});

const CreateBody = z.object({ data: PublicationFieldsSchema, authors: z.array(AuthorEntry) });
const UpdateBody = z.object({ data: PublicationFieldsSchema, authors: z.array(AuthorEntry) });

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
  const result = await getPublicationEditView(id, c.get("locale"));
  if (!result.publication) throw notFound();
  return c.json(result);
});

router.post("/", validate("json", CreateBody), async (c) => {
  const { data, authors } = c.req.valid("json");
  const id = await createPublication(data as PublicationFields, authors as AuthorInput[]);
  return c.json({ id }, 201);
});

router.put("/:id", validate("param", IdParam), validate("json", UpdateBody), async (c) => {
  const { id } = c.req.valid("param");
  const { data, authors } = c.req.valid("json");
  await updatePublication(id, data as PublicationFields, authors as AuthorInput[]);
  return c.json(okStatus());
});

router.delete("/:id", validate("param", IdParam), async (c) => {
  const { id } = c.req.valid("param");
  await deletePublication(id);
  return c.json(okStatus());
});

router.put("/:id/authors", validate("param", IdParam), validate("json", z.array(AuthorEntry)), async (c) => {
  const { id } = c.req.valid("param");
  const authors = c.req.valid("json");
  await replaceAuthors(id, authors as AuthorInput[]);
  return c.json(okStatus());
});

export default router;
