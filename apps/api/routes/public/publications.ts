import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { resolveAssetAccessLinks } from "../../services/assets/service.js";
import { getPublication, listPublications, listPublicationsByFilter } from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({
  kindCode: z.enum(["journal_article", "conference_paper", "thesis"]).optional(),
  event: z.coerce.number().int().optional(),
  journal: z.coerce.number().int().optional(),
  university: z.coerce.number().int().optional(),
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { kindCode, event, journal, university } = c.req.valid("query");

  if (kindCode || event || journal || university) {
    const rows = await listPublicationsByFilter(locale, {
      kindCode,
      eventId: event,
      journalId: journal,
      universityId: university,
    });

    return c.json(
      await Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          title: row.title,
          abstract: row.abstract,
          asset: await resolveAssetAccessLinks({ ownerType: "publication", ownerId: row.id, slot: "file" }),
          doi: row.doi,
          publishedAt: row.publishedAt,
          kindCode: row.kindCode,
          subtype:
            row.kindCode === "journal_article"
              ? { kindCode: "journal_article", journalArticle: { journalId: row.journalId, issue: row.issue } }
              : row.kindCode === "conference_paper"
                ? { kindCode: "conference_paper", conferencePaper: { eventId: row.eventId } }
                : { kindCode: "thesis", thesis: { universityId: row.universityId, thesisKindCode: row.thesisKindCode } },
          updatedAt: row.updatedAt,
          createdAt: row.createdAt,
        })),
      ),
    );
  }

  const rows = await listPublications(locale);
  return c.json(
    await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        title: row.title,
        abstract: row.abstract,
        asset: await resolveAssetAccessLinks({ ownerType: "publication", ownerId: row.id, slot: "file" }),
        doi: row.doi,
        publishedAt: row.publishedAt,
        kindCode: row.kindCode,
        subtype: row.subtype,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        authors: row.authors,
      })),
    ),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const pub = await getPublication(id, locale);
  if (!pub) return c.json({ error: "Not found" }, 404);

  return c.json({
    id: pub.id,
    title: pub.title,
    abstract: pub.abstract,
    asset: await resolveAssetAccessLinks({ ownerType: "publication", ownerId: pub.id, slot: "file" }),
    doi: pub.doi,
    publishedAt: pub.publishedAt,
    kindCode: pub.kindCode,
    subtype: pub.subtype,
    updatedAt: pub.updatedAt,
    createdAt: pub.createdAt,
    authors: pub.authors,
  });
});

export default router;
