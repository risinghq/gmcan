import { sql } from "kysely";

import { db } from "../db/client.js";
import { MEMBER_PUBLIC } from "../db/projections.js";
import { resolveAssetAccessUrl } from "./asset.service.js";

export async function globalSearch(q: string, types: Set<string>) {
  const like = `%${q}%`;

  const [publicationRows, members, newsRows, projectRows] = await Promise.all([
    types.has("publications")
      ? db
          .selectFrom("publication")
          .selectAll()
          .where((eb) =>
            eb.or([eb("title", "like", like), eb("abstractES", "like", like), eb("abstractEN", "like", like)]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("members")
      ? db
          .selectFrom("member")
          .select(MEMBER_PUBLIC)
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
          .leftJoin("member", "member.id", "news.authorId")
          .select([
            "news.id",
            "news.title",
            "news.titleEN",
            "news.publishedAt",
            "news.photo",
            "news.authorId",
            "news.newsTypeId",
            "news.status",
            sql<string>`TRIM(COALESCE(member.firstName, '') || ' ' || COALESCE(member.lastName, ''))`.as("authorName"),
          ])
          .where((eb) =>
            eb.or([
              eb("news.title", "like", like),
              eb("news.summary", "like", like),
              eb("news.summaryEN", "like", like),
            ]),
          )
          .execute()
      : Promise.resolve([]),
    types.has("projects")
      ? db
          .selectFrom("project")
          .innerJoin("research_line", "research_line.id", "project.researchLineId")
          .innerJoin("funding_source", "funding_source.id", "project.fundingSourceId")
          .select([
            "project.id",
            "project.title",
            "project.titleEN",
            "project.code",
            "project.fundedAmount",
            "project.description",
            "project.descriptionEN",
            "project.status",
            "project.startDate",
            "project.endDate",
            "project.researchLineId",
            "project.currencyId",
            "project.fundingSourceId",
            sql<string>`research_line.name`.as("researchLine"),
            sql<string>`funding_source.name`.as("fundingSource"),
          ])
          .where("project.status", "=", 1)
          .where((eb) =>
            eb.or([
              eb("project.title", "like", like),
              eb("project.titleEN", "like", like),
              eb("project.code", "like", like),
              eb("project.description", "like", like),
              eb("project.descriptionEN", "like", like),
              eb("research_line.name", "like", like),
              eb("research_line.nameEN", "like", like),
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
            sql<string>`member.firstName`.as("memberFirstName"),
            sql<string>`member.lastName`.as("memberLastName"),
            sql<string | null>`member.maternalName`.as("memberMaternalName"),
            sql<string | null>`member.photo`.as("memberPhoto"),
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
            photo: row.memberPhoto ?? null,
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
          .select(["member_project.projectId", "member.id", "member.firstName", "member.lastName", "member.photo"])
          .where("member_project.projectId", "in", projectIds)
          .execute()
      : [];

  const resolvedProjectMembers = await Promise.all(
    projectMembers.map(async (row) => ({
      projectId: row.projectId,
      entry: {
        memberId: row.id,
        name: row.firstName.length > 0 ? `${row.firstName[0]}. ${row.lastName}` : row.lastName,
        photo: row.photo,
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
          photoUrl: await resolveAssetAccessUrl({ resourceType: "news", resourceId: row.id, slot: "photo" }),
        }),
      ),
    ),
    projects,
  };
}
