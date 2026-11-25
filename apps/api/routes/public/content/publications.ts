import { Hono } from "hono";
import { z } from "zod";

import { notFound } from "../../../lib/errors/app-error.js";
import { validate } from "../../../lib/validate.js";
import { countPublicationsByKind, getPublication, listPublications } from "../../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const PublicPublicationListQuerySchema = z.object({
  kindCode: z.enum(["journal_article", "conference_paper", "thesis"]).optional(),
  event: z.coerce.number().int().positive().optional(),
  journal: z.coerce.number().int().positive().optional(),
  university: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

router.get("/", validate("query", PublicPublicationListQuerySchema), async (c) => {
  const locale = c.get("locale");
  const { kindCode, event, journal, university, limit } = c.req.valid("query");

  return c.json(
    await listPublications(locale, {
      kindCode,
      eventId: event,
      journalId: journal,
      universityId: university,
      limit,
    }),
  );
});

router.get("/counts", async (c) => c.json(await countPublicationsByKind()));

router.get("/:id", validate("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const pub = await getPublication(id, locale);
  if (!pub) throw notFound();
  return c.json(pub);
});

export default router;
