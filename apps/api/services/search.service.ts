import { type Locale } from "../lib/public-locale.js";
import { listProjectSearchMemberRowsByProjectIds } from "../repositories/members.js";
import { searchNewsRows } from "../repositories/news.js";
import { searchActiveProjectRows } from "../repositories/projects.js";
import { listPublicationAuthorRowsByPublicationIds, searchPublicationRows } from "../repositories/publications.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";

type PublicationAuthorEntry =
  | { kind: "registered"; memberId: number; authorOrder: number; name: string }
  | { kind: "external"; name: string; authorOrder: number };

type ProjectMemberEntry = { memberId: number; name: string };

function toShortMemberName(firstName: string, lastName: string): string {
  return firstName.length > 0 ? `${firstName[0]}. ${lastName}` : lastName;
}

export async function globalSearch(q: string, types: Set<string>, locale: Locale) {
  const like = `%${q}%`;

  const [publicationRows, members, newsRows, projectRows] = await Promise.all([
    types.has("publications") ? searchPublicationRows(locale, like) : Promise.resolve([]),
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

  const publicationIds = publicationRows.map((r) => r.id);
  const publicationAuthors =
    publicationIds.length > 0 ? await listPublicationAuthorRowsByPublicationIds(publicationIds) : [];

  const authorsByPublication = new Map<number, PublicationAuthorEntry[]>();
  for (const row of publicationAuthors) {
    const entry: PublicationAuthorEntry = row.memberId
      ? {
          kind: "registered",
          memberId: row.memberId,
          authorOrder: row.authorOrder,
          name: [row.memberFirstName, row.memberLastName, row.memberMaternalName].filter(Boolean).join(" "),
        }
      : {
          kind: "external",
          name: row.externalName ?? "",
          authorOrder: row.authorOrder,
        };

    const current = authorsByPublication.get(row.publicationId) ?? [];
    current.push(entry);
    authorsByPublication.set(row.publicationId, current);
  }

  const publications = publicationRows.map((p) => Object.assign(p, { authors: authorsByPublication.get(p.id) ?? [] }));

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
