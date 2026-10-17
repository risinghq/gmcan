import { db } from "./client.js";

export async function memberProjects(memberId: number) {
  return db
    .selectFrom("project")
    .innerJoin("project_member", "project_member.projectId", "project.id")
    .selectAll("project")
    .where("project_member.memberId", "=", memberId)
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
