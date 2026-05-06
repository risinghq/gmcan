import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getPublication, listPublications } from "../../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const PublicPublicationListQuerySchema = z.object({
  kindCode: z.enum(["journal_article", "conference_paper", "thesis"]).optional(),
  event: z.coerce.number().int().positive().optional(),
  journal: z.coerce.number().int().positive().optional(),
  university: z.coerce.number().int().positive().optional(),
});

router.get("/", zValidator("query", PublicPublicationListQuerySchema), async (c) => {
  const locale = c.get("locale");
  const { kindCode, event, journal, university } = c.req.valid("query");

  return c.json(
    await listPublications(locale, {
      kindCode,
      eventId: event,
      journalId: journal,
      universityId: university,
    }),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const pub = await getPublication(id, locale);
  if (!pub) return c.json({ error: "Not found" }, 404);
  return c.json(pub);
});

export default router;
