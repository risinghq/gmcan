import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { localizeField } from "../../lib/public-locale.js";
import { resolveAssetAccessUrl } from "../../services/asset.service.js";
import { getPublication, listPublications, listPublicationsByFilter } from "../../services/publication.service.js";

const router = new Hono();
const IdParam = z.object({ id: z.coerce.number().int().positive() });
const FilterQuery = z.object({
  type: z.coerce.number().int().optional(),
  event: z.coerce.number().int().optional(),
  journal: z.coerce.number().int().optional(),
  university: z.coerce.number().int().optional(),
});

router.get("/", zValidator("query", FilterQuery), async (c) => {
  const locale = c.get("locale");
  const { type, event, journal, university } = c.req.valid("query");
  if (type || event || journal || university) {
    const rows = await listPublicationsByFilter({
      typeId: type,
      eventId: event,
      journalId: journal,
      universityId: university,
    });
    return c.json(
      await Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          title: row.title,
          abstract: localizeField(row, locale, { es: "abstractES", en: "abstractEN", required: false }),
          asset: await resolveAssetAccessUrl({ resourceType: "publication", resourceId: row.id, slot: "file" }),
          journalIssue: row.journalIssue,
          doi: row.doi,
          publishedAt: row.publishedAt,
          typeId: row.typeId,
          journalId: row.journalId,
          universityId: row.universityId,
          eventId: row.eventId,
          thesisTypeId: row.thesisTypeId,
          updatedAt: row.updatedAt,
          createdAt: row.createdAt,
        })),
      ),
    );
  }
  const rows = await listPublications();
  return c.json(
    await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        title: row.title,
        abstract: localizeField(row, locale, { es: "abstractES", en: "abstractEN", required: false }),
        asset: await resolveAssetAccessUrl({ resourceType: "publication", resourceId: row.id, slot: "file" }),
        journalIssue: row.journalIssue,
        doi: row.doi,
        publishedAt: row.publishedAt,
        typeId: row.typeId,
        journalId: row.journalId,
        universityId: row.universityId,
        eventId: row.eventId,
        thesisTypeId: row.thesisTypeId,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        authors: (row.authors as any[]).map((author) =>
          author.kind === "registered" ? Object.assign(author, { asset: null }) : author,
        ),
      })),
    ),
  );
});

router.get("/:id", zValidator("param", IdParam), async (c) => {
  const locale = c.get("locale");
  const { id } = c.req.valid("param");
  const pub = await getPublication(id);
  if (!pub) return c.json({ error: "Not found" }, 404);
  return c.json({
    id: pub.id,
    title: pub.title,
    abstract: localizeField(pub, locale, { es: "abstractES", en: "abstractEN", required: false }),
    asset: await resolveAssetAccessUrl({ resourceType: "publication", resourceId: pub.id, slot: "file" }),
    journalIssue: pub.journalIssue,
    doi: pub.doi,
    publishedAt: pub.publishedAt,
    typeId: pub.typeId,
    journalId: pub.journalId,
    universityId: pub.universityId,
    eventId: pub.eventId,
    thesisTypeId: pub.thesisTypeId,
    updatedAt: pub.updatedAt,
    createdAt: pub.createdAt,
    authors: (pub.authors as any[]).map((author) =>
      author.kind === "registered" ? Object.assign(author, { asset: null }) : author,
    ),
  });
});

export default router;
