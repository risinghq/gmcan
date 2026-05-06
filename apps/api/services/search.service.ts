import { db } from "../db/client.js";
import { type Locale } from "../lib/public-locale.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";

export async function globalSearch(q: string, types: Set<string>, locale: Locale) {
  const like = `%${q}%`;

  const [publicationRows, members, newsRows, projectRows] = await Promise.all([
    types.has("publications")
      ? db
          .selectFrom("publication")
          .innerJoin("publication_translation", (join) =>
            join
              .onRef("publication_translation.publicationId", "=", "publication.id")
              .on("publication_translation.locale", "=", locale),
          )
          .select([
            "publication.id",
            "publication.kindCode",
            "publication.doi",
            "publication.publishedAt",
            "publication_translation.title as title",
            "publication_translation.abstract as abstract",
          ])
          .where((eb) =>
            eb.or([
              eb("publication_translation.title", "like", like),
              eb("publication_translation.abstract", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("members")
      ? publicLocalizedMemberSelectQuery(locale)
          .where((eb) =>
            eb.or([
              eb("firstName", "like", like),
              eb("lastName", "like", like),
              eb("maternalName", "like", like),
              eb("email", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("news")
      ? db
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
          .where((eb) =>
            eb.or([eb("news_translation.title", "like", like), eb("news_translation.summary", "like", like)]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("projects")
      ? db
          .selectFrom("project")
          .innerJoin("project_translation", (join) =>
            join
              .onRef("project_translation.projectId", "=", "project.id")
              .on("project_translation.locale", "=", locale),
          )
          .innerJoin("research_line_translation", (join) =>
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
          .execute()
      : Promise.resolve([]),
  ]);

  const publicationIds = publicationRows.map((r) => r.id);
  const publicationAuthors =
    publicationIds.length > 0
      ? await db
          .selectFrom("publication_author")
          .leftJoin("member", "member.id", "publication_author.memberId")
          .select([
            "publication_author.publicationId",
            "publication_author.authorOrder",
            "publication_author.externalName",
            "publication_author.memberId",
            "member.firstName as memberFirstName",
            "member.lastName as memberLastName",
            "member.maternalName as memberMaternalName",
          ])
          .where("publication_author.publicationId", "in", publicationIds)
          .orderBy("publication_author.publicationId", "asc")
          .orderBy("publication_author.authorOrder", "asc")
          .execute()
      : [];

  const resolvedPublicationAuthors = await Promise.all(
    publicationAuthors.map((row) => ({
      publicationId: row.publicationId,
      entry: row.memberId
        ? {
            kind: "registered" as const,
            memberId: row.memberId,
            authorOrder: row.authorOrder,
            name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
          }
        : { kind: "external" as const, name: row.externalName ?? "", authorOrder: row.authorOrder },
    })),
  );

  const authorsByPublication = new Map<number, unknown[]>();
  for (const row of resolvedPublicationAuthors) {
    const current = authorsByPublication.get(row.publicationId) ?? [];
    current.push(row.entry);
    authorsByPublication.set(row.publicationId, current);
  }

  const publications = publicationRows.map((p) => Object.assign(p, { authors: authorsByPublication.get(p.id) ?? [] }));

  const projectIds = projectRows.map((r) => r.id);
  const projectMembers =
    projectIds.length > 0
      ? await db
          .selectFrom("project_member")
          .innerJoin("member", "member.id", "project_member.memberId")
          .select(["project_member.projectId", "member.id", "member.firstName", "member.lastName"])
          .where("project_member.projectId", "in", projectIds)
          .execute()
      : [];

  const resolvedProjectMembers = await Promise.all(
    projectMembers.map((row) => ({
      projectId: row.projectId,
      entry: {
        memberId: row.id,
        name: row.firstName.length > 0 ? `${row.firstName[0]}. ${row.lastName}` : row.lastName,
      },
    })),
  );

  const membersByProject = new Map<number, unknown[]>();
  for (const row of resolvedProjectMembers) {
    const current = membersByProject.get(row.projectId) ?? [];
    current.push(row.entry);
    membersByProject.set(row.projectId, current);
  }

  const projects = projectRows.map((p) => Object.assign(p, { members: membersByProject.get(p.id) ?? [] }));

  return {
    publications,
    members,
    news: newsRows.map((row) =>
      Object.assign({}, row, {
        authorName: [row.authorFirstName, row.authorLastName].filter(Boolean).join(" ").trim(),
      }),
    ),
    projects,
  };
}
