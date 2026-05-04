import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { assetUrl } from "../../lib/upload.js";
import { localizeField } from "../../lib/public-locale.js";
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
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        abstract: localizeField(row, locale, { es: "abstractES", en: "abstractEN", required: false }),
        file: assetUrl(row.file),
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
        authors: row.authors?.map((author) =>
          author.kind === "registered" ? { ...author, photo: author.photoUrl ?? null, photoUrl: undefined } : author,
        ),
      })),
    );
  }
  const rows = await listPublications();
  return c.json(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      abstract: localizeField(row, locale, { es: "abstractES", en: "abstractEN", required: false }),
      file: assetUrl(row.file),
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
      authors: row.authors.map((author) =>
        author.kind === "registered" ? { ...author, photo: author.photoUrl ?? null, photoUrl: undefined } : author,
      ),
    })),
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
    file: assetUrl(pub.file),
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
    authors: pub.authors.map((author) =>
      author.kind === "registered" ? { ...author, photo: author.photoUrl ?? null, photoUrl: undefined } : author,
    ),
  });
});

export default router;
