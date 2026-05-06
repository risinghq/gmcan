import { sql } from "kysely";

import { db } from "../db/client.js";
import { publicationWithAuthors } from "../db/views.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminPublicationListItem } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./asset.service.js";

export interface AuthorInput {
  kind: "registered" | "external";
  memberId?: number;
  externalName?: string;
  isPrincipal: number;
}

export interface PublicationFields {
  translations: LocalizedTranslations<{ title: string; abstract?: string }>;
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
  return {
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
    ])
    .where("publication_author.publicationId", "=", publicationId)
    .orderBy("publication_author.isPrincipal", "asc")
    .execute();

  return Promise.all(
    rows.map(async (row) => {
      if (row.memberId) {
        return {
          kind: "registered" as const,
          memberId: row.memberId,
          name: `${row.memberFirstName ?? ""} ${row.memberLastName ?? ""}${row.memberMaternalName ? " " + row.memberMaternalName : ""}`.trim(),
          photo: null,
          photoUrl: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.memberId, slot: "photo" }),
          isPrincipal: row.isPrincipal,
        };
      }
      return {
        kind: "external" as const,
        name: row.externalName ?? "",
        isPrincipal: row.isPrincipal,
      };
    }),
  );
}

export async function listPublications(locale: Locale) {
  const publications = await db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .select([
      "publication.id as id",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.journalIssue as journalIssue",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
      "publication.typeId as typeId",
      "publication.journalId as journalId",
      "publication.universityId as universityId",
      "publication.eventId as eventId",
      "publication.thesisTypeId as thesisTypeId",
    ])
    .execute();
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
    ])
    .where("publication_author.publicationId", "in", ids)
    .orderBy("publication_author.publicationId", "asc")
    .orderBy("publication_author.isPrincipal", "asc")
    .execute();

  const resolvedAuthorRows = await Promise.all(
    authorRows.map(async (row) => ({
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
  const authorsByPublication = new Map<number, ReturnType<typeof authorRows.map>>();
  for (const row of resolvedAuthorRows) {
    const current = authorsByPublication.get(row.publicationId) ?? [];
    current.push(row.entry);
    authorsByPublication.set(row.publicationId, current);
  }

  return publications.map((p) => Object.assign(p, { authors: authorsByPublication.get(p.id) ?? [] }));
}

export async function listAdminPublications(typeId?: number): Promise<AdminPublicationListItem[]> {
  let query = db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", DEFAULT_LOCALE),
    )
    .select([
      "publication.id as id",
      "publication_translation.title as title",
      "publication.publishedAt as publishedAt",
      "publication.typeId as typeId",
      "publication.journalId as journalId",
      "publication.universityId as universityId",
      "publication.thesisTypeId as thesisTypeId",
      "publication.doi as doi",
      "publication.eventId as eventId",
    ]);
  if (typeId !== undefined) query = query.where("publication.typeId", "=", typeId);
  const publications = await query.orderBy("publication.publishedAt", "desc").execute();
  if (publications.length === 0) return [];

  const publicationIds = publications.map((publication) => publication.id);
  const [eventRows, authorRows] = await Promise.all([
    db
      .selectFrom("event")
      .innerJoin("event_translation", (join) =>
        join.onRef("event_translation.eventId", "=", "event.id").on("event_translation.locale", "=", DEFAULT_LOCALE),
      )
      .select(["event.id as id", "event_translation.name as name"])
      .execute(),
    db
      .selectFrom("publication_author")
      .leftJoin("member", "member.id", "publication_author.memberId")
      .select([
        "publication_author.publicationId as publicationId",
        "publication_author.isPrincipal as isPrincipal",
        "publication_author.externalName as externalName",
        "publication_author.memberId as memberId",
        "member.firstName as firstName",
        "member.lastName as lastName",
        "member.maternalName as maternalName",
      ])
      .where("publication_author.publicationId", "in", publicationIds)
      .orderBy("publication_author.publicationId", "asc")
      .orderBy("publication_author.isPrincipal", "asc")
      .orderBy("publication_author.id", "asc")
      .execute(),
  ]);

  const eventsById = new Map(eventRows.map((eventRow) => [eventRow.id, eventRow.name]));
  const firstAuthorByPublication = new Map<number, { name: string; asset: string | null }>();
  const firstAuthorCandidates = await Promise.all(
    authorRows.map(async (row) => ({
      publicationId: row.publicationId,
      value: row.memberId
        ? {
            name: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
            asset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.memberId, slot: "photo" }),
          }
        : { name: row.externalName ?? "", asset: null },
    })),
  );
  for (const row of firstAuthorCandidates) {
    if (firstAuthorByPublication.has(row.publicationId)) continue;
    firstAuthorByPublication.set(row.publicationId, row.value);
  }

  return publications.map((publication) => {
    const firstAuthor = firstAuthorByPublication.get(publication.id);
    return {
      id: publication.id,
      title: publication.title,
      publishedAt: publication.publishedAt,
      typeId: publication.typeId,
      journalId: publication.journalId,
      universityId: publication.universityId,
      thesisTypeId: publication.thesisTypeId,
      doi: publication.doi,
      eventId: publication.eventId,
      eventName: publication.eventId ? (eventsById.get(publication.eventId) ?? "") : "",
      publishedAtLabel: monthYearEs(publication.publishedAt),
      firstAuthorName: firstAuthor?.name ?? "",
      firstAuthorAsset: firstAuthor?.asset ?? null,
    };
  });
}

export async function getPublication(id: number, locale: Locale) {
  const publication = await db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .select([
      "publication.id as id",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.journalIssue as journalIssue",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
      "publication.typeId as typeId",
      "publication.journalId as journalId",
      "publication.universityId as universityId",
      "publication.eventId as eventId",
      "publication.thesisTypeId as thesisTypeId",
    ])
    .where("publication.id", "=", id)
    .executeTakeFirst();
  if (!publication) return null;
  const authors = await attachAuthors(id);
  return { ...publication, authors };
}

export async function getPublicationEditView(id: number) {
  const result = await publicationWithAuthors(id);
  if (!result.publication) return result;

  const translations = await db
    .selectFrom("publication_translation")
    .select(["locale", "title", "abstract"])
    .where("publicationId", "=", id)
    .execute();

  return {
    publication: Object.assign({}, result.publication, {
      translations: Object.fromEntries(
        translations.map((tr) => [tr.locale, { title: tr.title, abstract: tr.abstract ?? undefined }]),
      ),
    }),
    authors: result.authors,
  };
}

export async function listPublicationsByFilter(
  locale: Locale,
  filter: {
    typeId?: number;
    eventId?: number;
    journalId?: number;
    universityId?: number;
  },
) {
  let query = db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .select([
      "publication.id as id",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.journalIssue as journalIssue",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
      "publication.typeId as typeId",
      "publication.journalId as journalId",
      "publication.universityId as universityId",
      "publication.eventId as eventId",
      "publication.thesisTypeId as thesisTypeId",
    ]);
  if (filter.typeId) query = query.where("publication.typeId", "=", filter.typeId);
  if (filter.eventId) query = query.where("publication.eventId", "=", filter.eventId);
  if (filter.journalId) query = query.where("publication.journalId", "=", filter.journalId);
  if (filter.universityId) query = query.where("publication.universityId", "=", filter.universityId);
  return query.execute();
}

export async function searchPublications(q: string) {
  const like = `%${q}%`;
  return db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", DEFAULT_LOCALE),
    )
    .selectAll("publication")
    .where((eb) =>
      eb.or([eb("publication_translation.title", "like", like), eb("publication_translation.abstract", "like", like)]),
    )
    .execute();
}

export async function createPublication(data: PublicationFields, authors: AuthorInput[]) {
  return db.transaction().execute(async (trx) => {
    const result = await trx.insertInto("publication").values(toPublicationRow(data)).executeTakeFirstOrThrow();
    const id = Number(result.insertId);

    await trx
      .insertInto("publication_translation")
      .values(
        Object.entries(data.translations).map(([locale, tr]) => ({
          publicationId: id,
          locale,
          title: tr.title,
          abstract: tr.abstract ?? null,
        })),
      )
      .execute();

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
    await trx.deleteFrom("publication_translation").where("publicationId", "=", id).execute();
    await trx
      .insertInto("publication_translation")
      .values(
        Object.entries(data.translations).map(([locale, tr]) => ({
          publicationId: id,
          locale,
          title: tr.title,
          abstract: tr.abstract ?? null,
        })),
      )
      .execute();

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
