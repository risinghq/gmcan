import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { localizeField } from "../../lib/public-locale.js";
import { globalSearch } from "../../services/search.service.js";

const router = new Hono();

const SearchQuery = z.object({
  q: z.string().default(""),
  types: z.string().default("publications,members,news,projects"),
});

router.get("/", zValidator("query", SearchQuery), async (c) => {
  const locale = c.get("locale");
  const { q, types } = c.req.valid("query");
  const term = q.trim();

  if (term.length < 2) {
    return c.json({ publications: [], members: [], news: [], projects: [] });
  }

  const requested = new Set(types.split(",").map((t) => t.trim()));
  const result = await globalSearch(term, requested);
  return c.json({
    publications: result.publications.map((row) => ({
      id: row.id,
      title: row.title,
      abstract: localizeField(row, locale, { es: "abstractES", en: "abstractEN", required: false }),
      file: row.fileUrl,
      journalIssue: row.journalIssue,
      doi: row.doi,
      publishedAt: row.publishedAt,
      typeId: row.typeId,
      journalId: row.journalId,
      universityId: row.universityId,
      eventId: row.eventId,
      thesisTypeId: row.thesisTypeId,
      authors: row.authors.map((author) =>
        author.kind === "registered" ? { ...author, photo: author.photoUrl ?? null, photoUrl: undefined } : author,
      ),
    })),
    members: result.members.map((row) => ({
      ...row,
      bio: localizeField(row, locale, { es: "bio", en: "bioEN", required: false }),
    })),
    news: result.news.map((row) => ({
      id: row.id,
      title: localizeField(row, locale, { es: "title", en: "titleEN" }),
      publishedAt: row.publishedAt,
      photo: row.photoUrl,
      newsTypeId: row.newsTypeId,
      status: row.status,
      authorName: row.authorName,
    })),
    projects: result.projects.map((row) => ({
      id: row.id,
      title: localizeField(row, locale, { es: "title", en: "titleEN" }),
      code: row.code,
      fundedAmount: row.fundedAmount,
      description: localizeField(row, locale, { es: "description", en: "descriptionEN" }),
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      researchLineId: row.researchLineId,
      fundingSourceId: row.fundingSourceId,
      currencyId: row.currencyId,
      researchLine: localizeField(row, locale, { es: "researchLine", en: "researchLine" }),
      fundingSource: localizeField(row, locale, { es: "fundingSource", en: "fundingSource" }),
      members: row.members.map((member) => ({ ...member, photo: member.photoUrl })),
    })),
  });
});

export default router;
