import { sql } from "kysely";

import { db } from "../db/client.js";
import { publicationWithAuthors } from "../db/views.js";
import type { Bilingual } from "../lib/admin-translations.js";

export interface AuthorInput {
  kind: "registered" | "external";
  memberId?: number;
  externalName?: string;
  isPrincipal: number;
}

export interface PublicationFields {
  translations: Bilingual<{ title: string; abstract?: string }>;
  doi?: string;
  publishedAt: string;
  journalIssue?: number;
  typeId: number;
  journalId?: number;
  universityId?: number;
  thesisTypeId?: number;
  eventId?: number;
}

function toPublicationRow(data: PublicationFields) {
  const es = data.translations.es;
  const en = data.translations.en;
  return {
    title: es.title,
    abstractES: es.abstract ?? null,
    abstractEN: en.abstract ?? null,
    doi: data.doi,
    publishedAt: data.publishedAt,
    journalIssue: data.journalIssue,
    typeId: data.typeId,
    journalId: data.journalId,
    universityId: data.universityId,
    thesisTypeId: data.thesisTypeId,
    eventId: data.eventId,
  };
}

async function attachAuthors(publicationId: number) {
  const rows = await db
    .selectFrom("publication_author")
    .leftJoin("member", "member.id", "publication_author.memberId")
    .select([
      "publication_author.isPrincipal",
      "publication_author.externalName",
      "publication_author.memberId",
      sql<string>`member.firstName`.as("memberFirstName"),
      sql<string>`member.lastName`.as("memberLastName"),
      sql<string | null>`member.maternalName`.as("memberMaternalName"),
      sql<string | null>`member.photo`.as("memberPhoto"),
    ])
    .where("publication_author.publicationId", "=", publicationId)
    .orderBy("publication_author.isPrincipal", "asc")
    .execute();

  return rows.map((row) => {
    if (row.memberId) {
      return {
        kind: "registered" as const,
        memberId: row.memberId,
        name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
        photo: row.memberPhoto ?? null,
        isPrincipal: row.isPrincipal,
      };
    }
    return {
      kind: "external" as const,
      name: row.externalName ?? "",
      isPrincipal: row.isPrincipal,
    };
  });
}

export async function listPublications() {
  const publications = await db.selectFrom("publication").selectAll().execute();
  if (publications.length === 0) return [];

  const ids = publications.map((p) => p.id);
  const authorRows = await db
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
    .where("publication_author.publicationId", "in", ids)
    .orderBy("publication_author.publicationId", "asc")
    .orderBy("publication_author.isPrincipal", "asc")
    .execute();

  const authorsByPublication = new Map<number, ReturnType<typeof authorRows.map>>();
  for (const row of authorRows) {
    const entry = row.memberId
      ? {
          kind: "registered" as const,
          memberId: row.memberId,
          name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
          photo: row.memberPhoto ?? null,
          isPrincipal: row.isPrincipal,
        }
      : { kind: "external" as const, name: row.externalName ?? "", isPrincipal: row.isPrincipal };
    const current = authorsByPublication.get(row.publicationId) ?? [];
    current.push(entry);
    authorsByPublication.set(row.publicationId, current);
  }

  return publications.map((p) => Object.assign(p, { authors: authorsByPublication.get(p.id) ?? [] }));
}

export async function getPublication(id: number) {
  const publication = await db.selectFrom("publication").selectAll().where("id", "=", id).executeTakeFirst();
  if (!publication) return null;
  const authors = await attachAuthors(id);
  return { ...publication, authors };
}

export async function getPublicationEditView(id: number) {
  return publicationWithAuthors(id);
}

export async function listPublicationsByFilter(filter: {
  typeId?: number;
  eventId?: number;
  journalId?: number;
  universityId?: number;
}) {
  let query = db.selectFrom("publication").selectAll();
  if (filter.typeId) query = query.where("typeId", "=", filter.typeId);
  if (filter.eventId) query = query.where("eventId", "=", filter.eventId);
  if (filter.journalId) query = query.where("journalId", "=", filter.journalId);
  if (filter.universityId) query = query.where("universityId", "=", filter.universityId);
  return query.execute();
}

export async function searchPublications(q: string) {
  const like = `%${q}%`;
  return db
    .selectFrom("publication")
    .selectAll()
    .where((eb) => eb.or([eb("title", "like", like), eb("abstractES", "like", like), eb("abstractEN", "like", like)]))
    .execute();
}

export async function createPublication(data: PublicationFields, authors: AuthorInput[]) {
  return db.transaction().execute(async (trx) => {
    const result = await trx.insertInto("publication").values(toPublicationRow(data)).executeTakeFirstOrThrow();
    const id = Number(result.insertId);
    if (authors.length > 0) {
      await trx
        .insertInto("publication_author")
        .values(
          authors.map((a) => ({
            publicationId: id,
            isPrincipal: a.isPrincipal,
            externalName: a.kind === "external" ? (a.externalName ?? null) : null,
            memberId: a.kind === "registered" ? (a.memberId ?? null) : null,
          })),
        )
        .execute();
    }
    return id;
  });
}

export async function updatePublication(id: number, data: PublicationFields, authors: AuthorInput[]) {
  await db.transaction().execute(async (trx) => {
    await trx.updateTable("publication").set(toPublicationRow(data)).where("id", "=", id).execute();
    await trx.deleteFrom("publication_author").where("publicationId", "=", id).execute();
    if (authors.length > 0) {
      await trx
        .insertInto("publication_author")
        .values(
          authors.map((a) => ({
            publicationId: id,
            isPrincipal: a.isPrincipal,
            externalName: a.kind === "external" ? (a.externalName ?? null) : null,
            memberId: a.kind === "registered" ? (a.memberId ?? null) : null,
          })),
        )
        .execute();
    }
  });
}

export async function deletePublication(id: number) {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("publication_author").where("publicationId", "=", id).execute();
    await trx.deleteFrom("publication").where("id", "=", id).execute();
  });
}

export async function getPublicationFile(id: number) {
  return db.selectFrom("publication").select("file").where("id", "=", id).executeTakeFirst();
}

export async function setPublicationFile(id: number, file: string) {
  await db.updateTable("publication").set({ file }).where("id", "=", id).execute();
}

export async function replaceAuthors(publicationId: number, authors: AuthorInput[]) {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("publication_author").where("publicationId", "=", publicationId).execute();
    if (authors.length > 0) {
      await trx
        .insertInto("publication_author")
        .values(
          authors.map((a) => ({
            publicationId,
            isPrincipal: a.isPrincipal,
            externalName: a.kind === "external" ? (a.externalName ?? null) : null,
            memberId: a.kind === "registered" ? (a.memberId ?? null) : null,
          })),
        )
        .execute();
    }
  });
}

export async function listAuthorsByPublication(publicationId: number) {
  return attachAuthors(publicationId);
}

export async function listPublicationsByMember(memberId: number) {
  return db
    .selectFrom("publication")
    .innerJoin("publication_author", "publication_author.publicationId", "publication.id")
    .selectAll("publication")
    .where("publication_author.memberId", "=", memberId)
    .execute();
}
