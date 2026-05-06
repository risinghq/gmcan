import { db } from "../db/client.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import { resolveAssetAccessUrl } from "./asset.service.js";
import { localizedMemberSelectQuery } from "./member-read-model.js";

export async function globalSearch(q: string, types: Set<string>, locale: Locale) {
  const like = `%${q}%`;

  const [publicationRows, members, newsRows, projectRows] = await Promise.all([
    types.has("publications")
      ? db
          .selectFrom("publication")
          .innerJoin("publication_translation", (join) =>
            join
              .onRef("publication_translation.publicationId", "=", "publication.id")
              .on("publication_translation.locale", "=", DEFAULT_LOCALE),
          )
          .selectAll()
          .where((eb) =>
            eb.or([
              eb("publication_translation.title", "like", like),
              eb("publication_translation.abstract", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("members")
      ? localizedMemberSelectQuery(locale)
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
            join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", DEFAULT_LOCALE),
          )
          .leftJoin("member", "member.id", "news.authorId")
          .select([
            "news.id",
            "news_translation.title as title",
            "news.publishedAt",
            "news.authorId",
            "news.newsTypeId",
            "news.status",
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
              .on("project_translation.locale", "=", DEFAULT_LOCALE),
          )
          .innerJoin("research_line", "research_line.id", "project.researchLineId")
          .innerJoin("funding_source", "funding_source.id", "project.fundingSourceId")
          .select([
            "project.id",
            "project_translation.title as title",
            "project.code",
            "project.fundedAmount",
            "project_translation.description as description",
            "project.status",
            "project.startDate",
            "project.endDate",
            "project.researchLineId",
            "project.currencyId",
            "project.fundingSourceId",
            "funding_source.name as fundingSource",
          ])
          .where("project.status", "=", 1)
          .where((eb) =>
            eb.or([
              eb("project_translation.title", "like", like),
              eb("project.code", "like", like),
              eb("project_translation.description", "like", like),
              eb("funding_source.name", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
  ]);

  // Attach authors to publications
  const publicationIds = publicationRows.map((r) => r.id);
  const publicationAuthors =
    publicationIds.length > 0
      ? await db
          .selectFrom("publication_author")
          .leftJoin("member", "member.id", "publication_author.memberId")
          .select([
            "publication_author.publicationId",
            "publication_author.isPrincipal",
            "publication_author.externalName",
            "publication_author.memberId",
            "member.firstName as memberFirstName",
            "member.lastName as memberLastName",
            "member.maternalName as memberMaternalName",
          ])
          .where("publication_author.publicationId", "in", publicationIds)
          .orderBy("publication_author.publicationId", "asc")
          .orderBy("publication_author.isPrincipal", "asc")
          .execute()
      : [];

  const resolvedPublicationAuthors = await Promise.all(
    publicationAuthors.map(async (row) => ({
      publicationId: row.publicationId,
      entry: row.memberId
        ? {
            kind: "registered" as const,
            memberId: row.memberId,
            name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
            photo: null,
            photoUrl: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.memberId, slot: "photo" }),
            isPrincipal: row.isPrincipal,
          }
        : { kind: "external" as const, name: row.externalName ?? "", isPrincipal: row.isPrincipal },
    })),
  );
  const authorsByPublication = new Map<number, unknown[]>();
  for (const row of resolvedPublicationAuthors) {
    const current = authorsByPublication.get(row.publicationId) ?? [];
    current.push(row.entry);
    authorsByPublication.set(row.publicationId, current);
  }

  const publications = publicationRows.map((p) => Object.assign(p, { authors: authorsByPublication.get(p.id) ?? [] }));

  // Attach members to projects
  const projectIds = projectRows.map((r) => r.id);
  const projectMembers =
    projectIds.length > 0
      ? await db
          .selectFrom("member_project")
          .innerJoin("member", "member.id", "member_project.memberId")
          .select(["member_project.projectId", "member.id", "member.firstName", "member.lastName"])
          .where("member_project.projectId", "in", projectIds)
          .execute()
      : [];

  const resolvedProjectMembers = await Promise.all(
    projectMembers.map(async (row) => ({
      projectId: row.projectId,
      entry: {
        memberId: row.id,
        name: row.firstName.length > 0 ? `${row.firstName[0]}. ${row.lastName}` : row.lastName,
        photo: null,
        photoUrl: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.id, slot: "photo" }),
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
    members: await Promise.all(
      members.map(async (row) =>
        Object.assign({}, row, {
          photoUrl: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.id, slot: "photo" }),
        }),
      ),
    ),
    news: await Promise.all(
      newsRows.map(async (row) =>
        Object.assign({}, row, {
          authorName: [row.authorFirstName, row.authorLastName].filter(Boolean).join(" ").trim(),
          photoUrl: await resolveAssetAccessUrl({ resourceType: "news", resourceId: row.id, slot: "photo" }),
        }),
      ),
    ),
    projects: projects.map((project) => Object.assign({ researchLine: "" }, project)),
  };
}
