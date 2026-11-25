import { db, queryInChunks } from "../db/client.js";
import { type Locale } from "../lib/public-locale.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";
import { newsSearchFilter } from "./news.service.js";
import { listPublications } from "./publication.service.js";

async function searchNewsRows(locale: Locale, q: string) {
  const filter = newsSearchFilter(locale, q, ["title", "summary"]);
  if (!filter) return [];
  return db
    .selectFrom("news")
    .leftJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .select([
      "news.id",
      "news_translation.title as title",
      "news.publishedAt",
      "news.authorId",
      "news.newsKindCode",
      "news.statusCode",
      "member.firstName as authorFirstName",
      "member.lastName as authorLastName",
    ])
    .where(filter)
    .where("news.statusCode", "=", "published")
    .execute();
}

async function searchActiveProjectRows(locale: Locale, like: string) {
  return db
    .selectFrom("project")
    .innerJoin("project_translation", (join) =>
      join.onRef("project_translation.projectId", "=", "project.id").on("project_translation.locale", "=", locale),
    )
    .leftJoin("research_line_translation", (join) =>
      join
        .onRef("research_line_translation.researchLineId", "=", "project.researchLineId")
        .on("research_line_translation.locale", "=", locale),
    )
    .innerJoin("funding_source", "funding_source.code", "project.fundingSourceCode")
    .select([
      "project.id",
      "project_translation.title as title",
      "project.code",
      "project.fundedAmountMinor",
      "project_translation.description as description",
      "project.statusCode",
      "project.startDate",
      "project.endDate",
      "project.researchLineId",
      "project.currencyCode",
      "project.fundingSourceCode",
      "research_line_translation.name as researchLine",
      "funding_source.name as fundingSource",
    ])
    .where("project.statusCode", "=", "active")
    .where((eb) =>
      eb.or([
        eb("project_translation.title", "like", like),
        eb("project.code", "like", like),
        eb("project_translation.description", "like", like),
        eb("research_line_translation.name", "like", like),
        eb("funding_source.name", "like", like),
      ]),
    )
    .execute();
}

interface ProjectSearchMemberRow {
  projectId: number;
  id: number;
  firstName: string;
  lastName: string;
}

async function listProjectSearchMemberRowsByProjectIds(projectIds: number[]) {
  return queryInChunks(
    projectIds,
    (chunk) =>
      db
        .selectFrom("project_member")
        .innerJoin("member", "member.id", "project_member.memberId")
        .select(["project_member.projectId", "member.id", "member.firstName", "member.lastName"])
        .where("project_member.projectId", "in", chunk)
        .execute() as Promise<ProjectSearchMemberRow[]>,
  );
}

type ProjectMemberEntry = { memberId: number; name: string };

function toShortMemberName(firstName: string, lastName: string): string {
  return firstName.length > 0 ? `${firstName[0]}. ${lastName}` : lastName;
}

export async function globalSearch(q: string, types: Set<string>, locale: Locale) {
  const like = `%${q}%`;

  const [publications, members, newsRows, projectRows] = await Promise.all([
    types.has("publications") ? listPublications(locale, { q }) : Promise.resolve([]),
    types.has("members")
      ? publicLocalizedMemberSelectQuery(locale)
          .where((eb) =>
            eb.or([eb("firstName", "like", like), eb("lastName", "like", like), eb("maternalName", "like", like)]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("news") ? searchNewsRows(locale, q) : Promise.resolve([]),
    types.has("projects") ? searchActiveProjectRows(locale, like) : Promise.resolve([]),
  ]);

  const projectIds = projectRows.map((r) => r.id);
  const projectMembers = projectIds.length > 0 ? await listProjectSearchMemberRowsByProjectIds(projectIds) : [];

  const membersByProject = new Map<number, ProjectMemberEntry[]>();
  for (const row of projectMembers) {
    const current = membersByProject.get(row.projectId) ?? [];
    current.push({
      memberId: row.id,
      name: toShortMemberName(row.firstName, row.lastName),
    });
    membersByProject.set(row.projectId, current);
  }

  const projects = projectRows.map((p) => Object.assign(p, { members: membersByProject.get(p.id) ?? [] }));

  return {
    publications,
    members,
    news: newsRows.map((row) =>
      Object.assign({}, row, {
        authorName: [row.authorFirstName, row.authorLastName].filter(Boolean).join(" "),
      }),
    ),
    projects,
  };
}
