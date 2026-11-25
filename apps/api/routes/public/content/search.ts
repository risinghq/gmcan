import { Hono } from "hono";
import { z } from "zod";

import { validate } from "../../../lib/validate.js";
import { resolveAssetAccessUrls } from "../../../services/assets/service.js";
import { memberFullName, resolveMemberPhotoViews } from "../../../services/member-photo.service.js";
import { globalSearch } from "../../../services/search.service.js";

const router = new Hono();

const SearchQuery = z.object({
  q: z.string().default(""),
  types: z.string().default("publications,members,news,projects"),
});

router.get("/", validate("query", SearchQuery), async (c) => {
  const locale = c.get("locale");
  const { q, types } = c.req.valid("query");
  const term = q.trim();

  if (term.length < 2) {
    return c.json({ publications: [], members: [], news: [], projects: [] });
  }

  const requested = new Set(types.split(",").map((t) => t.trim()));
  const result = await globalSearch(term, requested, locale);

  const [newsAssets, photos] = await Promise.all([
    resolveAssetAccessUrls({ ownerType: "news", ownerIds: result.news.map((row) => row.id), slot: "photo" }),
    resolveMemberPhotoViews(
      [
        ...result.members.map((row) => ({ memberId: row.id, fullName: memberFullName(row) })),
        ...result.projects.flatMap((row) =>
          row.members.map((member) => ({ memberId: member.memberId, fullName: member.name })),
        ),
      ],
      locale,
    ),
  ]);

  const publications = result.publications.map(({ createdAt: _c, updatedAt: _u, ...row }) => row);

  const members = result.members.map((row) => Object.assign({}, row, photos.get(row.id)));

  const news = result.news.map((row) => ({
    id: row.id,
    title: row.title,
    publishedAt: row.publishedAt,
    asset: newsAssets.get(row.id) ?? null,
    newsKindCode: row.newsKindCode,
    statusCode: row.statusCode,
    authorName: row.authorName,
  }));

  const projects = result.projects.map((row) => ({
    id: row.id,
    title: row.title,
    code: row.code,
    fundedAmountMinor: row.fundedAmountMinor,
    description: row.description,
    statusCode: row.statusCode,
    startDate: row.startDate,
    endDate: row.endDate,
    researchLineId: row.researchLineId,
    fundingSourceCode: row.fundingSourceCode,
    currencyCode: row.currencyCode,
    researchLine: row.researchLine,
    fundingSource: row.fundingSource,
    members: row.members.map((member) => Object.assign({}, member, photos.get(member.memberId))),
  }));

  return c.json({ publications, members, news, projects });
});

export default router;
