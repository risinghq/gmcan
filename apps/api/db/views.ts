import { db } from "./client.js";
import { MEMBER_PUBLIC } from "./projections.js";

export interface AuthorEntry {
  kind: "registered" | "external";
  memberId?: number;
  name: string;
  isPrincipal: number;
}

export async function publicationWithAuthors(id: number): Promise<{
  publication: Record<string, unknown>;
  authors: AuthorEntry[];
}> {
  const [publication, rows] = await Promise.all([
    db.selectFrom("publication").selectAll().where("id", "=", id).executeTakeFirst(),
    db
      .selectFrom("publication_author")
      .leftJoin("member", "member.id", "publication_author.memberId")
      .select([
        "publication_author.isPrincipal",
        "publication_author.externalName",
        "publication_author.memberId",
        "member.firstName as memberFirstName",
        "member.lastName as memberLastName",
        "member.maternalName as memberMaternalName",
      ])
      .where("publication_author.publicationId", "=", id)
      .orderBy("publication_author.isPrincipal", "asc")
      .execute(),
  ]);

  const authors: AuthorEntry[] = rows.map((row) => {
    if (row.memberId) {
      return {
        kind: "registered" as const,
        memberId: row.memberId,
        name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
        isPrincipal: row.isPrincipal,
      };
    }
    return {
      kind: "external" as const,
      name: row.externalName ?? "",
      isPrincipal: row.isPrincipal,
    };
  });

  return { publication: publication as Record<string, unknown>, authors };
}

export async function memberProjects(memberId: number) {
  return db
    .selectFrom("project")
    .innerJoin("member_project", "member_project.projectId", "project.id")
    .selectAll("project")
    .where("member_project.memberId", "=", memberId)
    .execute();
}

export async function memberPublications(memberId: number) {
  return db
    .selectFrom("publication")
    .innerJoin("publication_author", "publication_author.publicationId", "publication.id")
    .selectAll("publication")
    .where("publication_author.memberId", "=", memberId)
    .execute();
}

export async function publicProfile(memberId: number) {
  const [member, projects, publications] = await Promise.all([
    db.selectFrom("member").select(MEMBER_PUBLIC).where("id", "=", memberId).executeTakeFirst(),
    memberProjects(memberId),
    memberPublications(memberId),
  ]);
  return { member, projects, publications };
}
