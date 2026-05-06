import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { resolveAssetAccessUrl } from "../../services/asset.service.js";
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
  const result = await globalSearch(term, requested, locale);
  const publications = await Promise.all(
    result.publications.map(async (row) => ({
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      asset: await resolveAssetAccessUrl({ resourceType: "publication", resourceId: row.id, slot: "file" }),
      journalIssue: row.journalIssue,
      doi: row.doi,
      publishedAt: row.publishedAt,
      typeId: row.typeId,
      journalId: row.journalId,
      universityId: row.universityId,
      eventId: row.eventId,
      thesisTypeId: row.thesisTypeId,
      authors: await Promise.all(
        row.authors.map(async (author) =>
          author.kind === "registered"
            ? Object.assign({}, author, {
                asset: await resolveAssetAccessUrl({
                  resourceType: "member",
                  resourceId: author.memberId,
                  slot: "photo",
                }),
              })
            : author,
        ),
      ),
    })),
  );

  const members = await Promise.all(
    result.members.map(async (row) =>
      Object.assign({}, row, {
        asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.id, slot: "photo" }),
      }),
    ),
  );

  const news = await Promise.all(
    result.news.map(async (row) => ({
      id: row.id,
      title: row.title,
      publishedAt: row.publishedAt,
      asset: await resolveAssetAccessUrl({ resourceType: "news", resourceId: row.id, slot: "photo" }),
      newsTypeId: row.newsTypeId,
      status: row.status,
      authorName: row.authorName,
    })),
  );

  const projects = await Promise.all(
    result.projects.map(async (row) => ({
      id: row.id,
      title: row.title,
      code: row.code,
      fundedAmount: row.fundedAmount,
      description: row.description,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      researchLineId: row.researchLineId,
      fundingSourceId: row.fundingSourceId,
      currencyId: row.currencyId,
      researchLine: row.researchLine,
      fundingSource: row.fundingSource,
      members: await Promise.all(
        row.members.map(async (member) =>
          Object.assign({}, member, {
            asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: member.memberId, slot: "photo" }),
          }),
        ),
      ),
    })),
  );

  return c.json({
    publications,
    members,
    news,
    projects,
  });
});

export default router;
