import type {
  AdminPublication,
  AdminPublicationListItem,
  AdminPublicationSubtype,
  PublicationAuthorWrite,
  PublicationSubtypeWrite,
  PublicationWrite,
} from "@gmcan/contracts/admin";
import type { PublicationAuthor, PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import type { RawBuilder } from "kysely";

import { atomic, db, insertedId, lastInsertId, queryInChunks } from "../db/client.js";
import type { PublicationKindCode } from "../db/schema.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import { resolveAssetAccessLinkMap, resolveAssetAccessUrl } from "./assets/service.js";
import { memberPhotoPlaceholderView, resolveMemberPhotoViews } from "./member-photo.service.js";

export interface PublicPublicationFilter {
  id?: number;
  kindCode?: PublicationKindCode;
  eventId?: number;
  journalId?: number;
  universityId?: number;
  memberId?: number;
}

export interface AdminPublicationFilter {
  kindCode?: PublicationKindCode;
  eventId?: number;
  journalId?: number;
  universityId?: number;
  q?: string;
}

function nameOf(first?: string | null, last?: string | null, maternal?: string | null): string {
  return [first, last, maternal].filter(Boolean).join(" ").trim();
}

/** The authors of every publication, in author order: one author query and one photo query for all of them. */
async function authorsByPublicationIds(
  publicationIds: number[],
  locale: Locale = DEFAULT_LOCALE,
): Promise<Map<number, PublicationAuthor[]>> {
  const rows = await queryInChunks(publicationIds, (chunk) =>
    db
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
      .where("publication_author.publicationId", "in", chunk)
      .orderBy("publication_author.authorOrder", "asc")
      .execute(),
  );

  const photos = await resolveMemberPhotoViews(
    rows.flatMap((row) =>
      row.memberId
        ? [
            {
              memberId: row.memberId,
              fullName: nameOf(row.memberFirstName, row.memberLastName, row.memberMaternalName),
            },
          ]
        : [],
    ),
    locale,
  );

  const authors = new Map<number, PublicationAuthor[]>(publicationIds.map((id) => [id, []]));
  for (const row of rows) {
    authors.get(row.publicationId)?.push(
      row.memberId
        ? ({
            kind: "registered",
            authorOrder: row.authorOrder,
            memberId: row.memberId,
            name: nameOf(row.memberFirstName, row.memberLastName, row.memberMaternalName),
            ...photos.get(row.memberId)!,
          } satisfies PublicationAuthor)
        : ({
            kind: "external",
            authorOrder: row.authorOrder,
            name: row.externalName ?? "",
          } satisfies PublicationAuthor),
    );
  }
  return authors;
}

async function subtypeByPublicationIds(publicationIds: number[]) {
  const [journalRows, conferenceRows, thesisRows] = await Promise.all([
    queryInChunks(publicationIds, (chunk) =>
      db.selectFrom("journal_article").selectAll().where("publicationId", "in", chunk).execute(),
    ),
    queryInChunks(publicationIds, (chunk) =>
      db.selectFrom("conference_paper").selectAll().where("publicationId", "in", chunk).execute(),
    ),
    queryInChunks(publicationIds, (chunk) =>
      db.selectFrom("thesis").selectAll().where("publicationId", "in", chunk).execute(),
    ),
  ]);

  const subtypes = new Map<number, PublicationSubtypeWrite>();
  for (const row of journalRows) {
    subtypes.set(row.publicationId, {
      kindCode: "journal_article",
      journalArticle: { journalId: row.journalId ?? undefined, issue: row.issue ?? undefined },
    });
  }
  for (const row of conferenceRows) {
    subtypes.set(row.publicationId, { kindCode: "conference_paper", conferencePaper: { eventId: row.eventId } });
  }
  for (const row of thesisRows) {
    subtypes.set(row.publicationId, {
      kindCode: "thesis",
      thesis: { universityId: row.universityId, thesisKindCode: row.thesisKindCode },
    });
  }

  return subtypes;
}

async function adminSubtypeByPublicationIds(
  publicationIds: number[],
  locale: Locale = DEFAULT_LOCALE,
): Promise<Map<number, AdminPublicationSubtype>> {
  const [journalRows, conferenceRows, thesisRows] = await Promise.all([
    queryInChunks(publicationIds, (chunk) =>
      db
        .selectFrom("journal_article")
        .leftJoin("journal", "journal.id", "journal_article.journalId")
        .select([
          "journal_article.publicationId as publicationId",
          "journal_article.journalId as journalId",
          "journal.name as journalName",
          "journal_article.issue as issue",
        ])
        .where("journal_article.publicationId", "in", chunk)
        .execute(),
    ),
    queryInChunks(publicationIds, (chunk) =>
      db
        .selectFrom("conference_paper")
        .leftJoin("event_translation", (join) =>
          join
            .onRef("event_translation.eventId", "=", "conference_paper.eventId")
            .on("event_translation.locale", "=", locale),
        )
        .select([
          "conference_paper.publicationId as publicationId",
          "conference_paper.eventId as eventId",
          "event_translation.name as eventName",
        ])
        .where("conference_paper.publicationId", "in", chunk)
        .execute(),
    ),
    queryInChunks(publicationIds, (chunk) =>
      db
        .selectFrom("thesis")
        .leftJoin("university_translation", (join) =>
          join
            .onRef("university_translation.universityId", "=", "thesis.universityId")
            .on("university_translation.locale", "=", locale),
        )
        .leftJoin("thesis_kind_translation", (join) =>
          join
            .onRef("thesis_kind_translation.thesisKindCode", "=", "thesis.thesisKindCode")
            .on("thesis_kind_translation.locale", "=", locale),
        )
        .select([
          "thesis.publicationId as publicationId",
          "thesis.universityId as universityId",
          "university_translation.name as universityName",
          "thesis.thesisKindCode as thesisKindCode",
          "thesis_kind_translation.name as thesisKindName",
        ])
        .where("thesis.publicationId", "in", chunk)
        .execute(),
    ),
  ]);

  const subtypes = new Map<number, AdminPublicationSubtype>();
  for (const row of journalRows) {
    subtypes.set(row.publicationId, {
      kindCode: "journal_article",
      journalArticle: {
        journalId: row.journalId,
        journalName: row.journalName ?? "",
        issue: row.issue,
      },
    });
  }
  for (const row of conferenceRows) {
    subtypes.set(row.publicationId, {
      kindCode: "conference_paper",
      conferencePaper: {
        eventId: row.eventId,
        eventName: row.eventName ?? "",
      },
    });
  }
  for (const row of thesisRows) {
    subtypes.set(row.publicationId, {
      kindCode: "thesis",
      thesis: {
        universityId: row.universityId,
        universityName: row.universityName ?? "",
        thesisKindCode: row.thesisKindCode,
        thesisKindName: row.thesisKindName ?? "",
      },
    });
  }

  return subtypes;
}

export async function listPublications(
  locale: Locale,
  filter: PublicPublicationFilter = {},
): Promise<PublicPublicationWithAuthors[]> {
  let query = db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .leftJoin("conference_paper", "conference_paper.publicationId", "publication.id")
    .leftJoin("journal_article", "journal_article.publicationId", "publication.id")
    .leftJoin("thesis", "thesis.publicationId", "publication.id")
    .select([
      "publication.id as id",
      "publication.kindCode as kindCode",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
    ]);

  if (filter.id) query = query.where("publication.id", "=", filter.id);
  if (filter.kindCode) query = query.where("publication.kindCode", "=", filter.kindCode);
  if (filter.eventId) query = query.where("conference_paper.eventId", "=", filter.eventId);
  if (filter.journalId) query = query.where("journal_article.journalId", "=", filter.journalId);
  if (filter.universityId) query = query.where("thesis.universityId", "=", filter.universityId);
  if (filter.memberId) {
    query = query
      .innerJoin("publication_author", "publication_author.publicationId", "publication.id")
      .where("publication_author.memberId", "=", filter.memberId);
  }

  const publications = await query.orderBy("publication.publishedAt", "desc").execute();

  if (publications.length === 0) return [];
  const ids = publications.map((p) => p.id);
  const [subtypes, authorsById, assets] = await Promise.all([
    subtypeByPublicationIds(ids),
    authorsByPublicationIds(ids, locale),
    resolveAssetAccessLinkMap({ ownerType: "publication", ownerIds: ids, slot: "file" }),
  ]);

  return publications.map((row) => {
    const subtype = subtypes.get(row.id);
    if (!subtype) throw new Error(`Publication ${row.id} is missing subtype data`);

    return {
      id: row.id,
      kindCode: row.kindCode,
      title: row.title,
      asset: assets.get(row.id) ?? null,
      abstract: row.abstract,
      doi: row.doi,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      subtype,
      authors: authorsById.get(row.id) ?? [],
    } satisfies PublicPublicationWithAuthors;
  });
}

export async function listAdminPublications(
  filter: AdminPublicationFilter = {},
  locale: Locale = DEFAULT_LOCALE,
): Promise<AdminPublicationListItem[]> {
  let query = db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", locale),
    )
    .leftJoin("conference_paper", "conference_paper.publicationId", "publication.id")
    .leftJoin("journal_article", "journal_article.publicationId", "publication.id")
    .leftJoin("thesis", "thesis.publicationId", "publication.id")
    .select([
      "publication.id as id",
      "publication.kindCode as kindCode",
      "publication_translation.title as title",
      "publication.publishedAt as publishedAt",
      "publication.doi as doi",
    ]);

  if (filter.kindCode) query = query.where("publication.kindCode", "=", filter.kindCode);
  if (filter.eventId) query = query.where("conference_paper.eventId", "=", filter.eventId);
  if (filter.journalId) query = query.where("journal_article.journalId", "=", filter.journalId);
  if (filter.universityId) query = query.where("thesis.universityId", "=", filter.universityId);
  if (filter.q) {
    const like = `%${filter.q}%`;
    query = query.where((eb) => eb("publication_translation.title", "like", like));
  }
  const publications = await query.orderBy("publication.publishedAt", "desc").execute();
  if (publications.length === 0) return [];

  const ids = publications.map((publication) => publication.id);
  const [subtypes, authorRows] = await Promise.all([
    adminSubtypeByPublicationIds(ids, locale),
    queryInChunks(ids, (chunk) =>
      db
        .selectFrom("publication_author")
        .leftJoin("member", "member.id", "publication_author.memberId")
        .select([
          "publication_author.publicationId as publicationId",
          "publication_author.externalName as externalName",
          "publication_author.memberId as memberId",
          "member.firstName as firstName",
          "member.lastName as lastName",
          "member.maternalName as maternalName",
        ])
        .where("publication_author.publicationId", "in", chunk)
        .orderBy("publication_author.publicationId", "asc")
        .orderBy("publication_author.authorOrder", "asc")
        .execute(),
    ),
  ]);

  const firstAuthorRowsByPublication = new Map<
    number,
    {
      externalName: string | null;
      memberId: number | null;
      firstName: string | null;
      lastName: string | null;
      maternalName: string | null;
    }
  >();
  for (const row of authorRows) {
    if (firstAuthorRowsByPublication.has(row.publicationId)) continue;
    firstAuthorRowsByPublication.set(row.publicationId, row);
  }
  const photos = await resolveMemberPhotoViews(
    [...firstAuthorRowsByPublication.values()].flatMap((row) =>
      row.memberId ? [{ memberId: row.memberId, fullName: nameOf(row.firstName, row.lastName, row.maternalName) }] : [],
    ),
    locale,
  );
  const firstAuthorByPublication = new Map(
    [...firstAuthorRowsByPublication].map(([publicationId, row]) => {
      if (!row.memberId) {
        const name = row.externalName ?? "";
        return [publicationId, { name, ...memberPhotoPlaceholderView({ fullName: name, locale }) }] as const;
      }
      return [
        publicationId,
        { name: nameOf(row.firstName, row.lastName, row.maternalName), ...photos.get(row.memberId)! },
      ] as const;
    }),
  );

  return publications.map((publication) => {
    const subtype = subtypes.get(publication.id);
    if (!subtype) throw new Error(`Publication ${publication.id} is missing admin subtype data`);
    const eventName = subtype.kindCode === "conference_paper" ? subtype.conferencePaper.eventName : "";
    const journalName = subtype.kindCode === "journal_article" ? subtype.journalArticle.journalName : "";
    const universityName = subtype.kindCode === "thesis" ? subtype.thesis.universityName : "";
    const thesisKindName = subtype.kindCode === "thesis" ? subtype.thesis.thesisKindName : "";
    const firstAuthor = firstAuthorByPublication.get(publication.id);
    const placeholder = memberPhotoPlaceholderView({ fullName: "", locale });

    return {
      id: publication.id,
      title: publication.title,
      kindCode: publication.kindCode,
      subtype,
      eventName,
      journalName,
      universityName,
      thesisKindName,
      doi: publication.doi,
      publishedAt: publication.publishedAt,
      publishedAtLabel: monthYearEs(publication.publishedAt),
      firstAuthorName: firstAuthor?.name ?? "",
      firstAuthorPhotoUrl: firstAuthor?.photoUrl ?? placeholder.photoUrl,
      firstAuthorPhotoAlt: firstAuthor?.photoAlt ?? placeholder.photoAlt,
    };
  });
}

export async function getPublication(id: number, locale: Locale) {
  return (await listPublications(locale, { id }))[0] ?? null;
}

function toAuthorWrite(row: {
  authorOrder: number;
  memberId: number | null;
  externalName: string | null;
}): PublicationAuthorWrite {
  return row.memberId !== null
    ? { kind: "registered", memberId: row.memberId, authorOrder: row.authorOrder }
    : { kind: "external", externalName: row.externalName ?? "", authorOrder: row.authorOrder };
}

export async function getAdminPublication(id: number): Promise<AdminPublication | null> {
  const publication = await db.selectFrom("publication").selectAll().where("id", "=", id).executeTakeFirst();
  if (!publication) return null;

  const [translations, subtypes, authors, asset] = await Promise.all([
    db
      .selectFrom("publication_translation")
      .select(["locale", "title", "abstract"])
      .where("publicationId", "=", id)
      .execute(),
    subtypeByPublicationIds([id]),
    db
      .selectFrom("publication_author")
      .select(["authorOrder", "memberId", "externalName"])
      .where("publicationId", "=", id)
      .orderBy("authorOrder")
      .execute(),
    resolveAssetAccessUrl({ ownerType: "publication", ownerId: id, slot: "file" }),
  ]);
  const subtype = subtypes.get(id);
  if (!subtype) throw new Error(`Publication ${id} has no subtype row`);

  return {
    id: publication.id,
    doi: publication.doi ?? undefined,
    publishedAt: publication.publishedAt,
    createdAt: publication.createdAt,
    updatedAt: publication.updatedAt,
    subtype,
    authors: authors.map(toAuthorWrite),
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { title: tr.title, abstract: tr.abstract ?? undefined }]),
    ),
    asset,
  };
}

export async function createPublication(data: PublicationWrite) {
  const publicationId = lastInsertId("publication");
  const now = new Date().toISOString();
  const results = await atomic([
    db.insertInto("publication").values({
      kindCode: data.subtype.kindCode,
      doi: data.doi || null,
      publishedAt: data.publishedAt,
      createdAt: now,
      updatedAt: now,
    }),
    translationsInsert(publicationId, data.translations),
    subtypeInsert(publicationId, data.subtype),
    authorsInsert(publicationId, data.authors),
  ]);
  return insertedId(results, 0);
}

type PublicationRef = number | RawBuilder<number>;

function translationsInsert(publicationId: PublicationRef, translations: PublicationWrite["translations"]) {
  return db.insertInto("publication_translation").values(
    Object.entries(translations).map(([locale, tr]) => ({
      publicationId,
      locale,
      title: tr.title,
      abstract: tr.abstract || null,
    })),
  );
}

function subtypeInsert(publicationId: PublicationRef, subtype: PublicationSubtypeWrite) {
  if (subtype.kindCode === "journal_article") {
    return db.insertInto("journal_article").values({
      publicationId,
      journalId: subtype.journalArticle.journalId ?? null,
      issue: subtype.journalArticle.issue ?? null,
    });
  }
  if (subtype.kindCode === "conference_paper") {
    return db.insertInto("conference_paper").values({ publicationId, eventId: subtype.conferencePaper.eventId });
  }
  return db.insertInto("thesis").values({
    publicationId,
    universityId: subtype.thesis.universityId,
    thesisKindCode: subtype.thesis.thesisKindCode,
  });
}

/** The write schema requires at least one author, so the insert is never empty. */
function authorsInsert(publicationId: PublicationRef, authors: PublicationAuthorWrite[]) {
  return db.insertInto("publication_author").values(
    authors.map((author) => ({
      publicationId,
      authorOrder: author.authorOrder,
      externalName: author.kind === "external" ? author.externalName : null,
      memberId: author.kind === "registered" ? author.memberId : null,
    })),
  );
}

export async function updatePublication(id: number, data: PublicationWrite) {
  await atomic([
    db
      .updateTable("publication")
      .set({
        kindCode: data.subtype.kindCode,
        doi: data.doi || null,
        publishedAt: data.publishedAt,
        updatedAt: new Date().toISOString(),
      })
      .where("id", "=", id),
    db.deleteFrom("journal_article").where("publicationId", "=", id),
    db.deleteFrom("conference_paper").where("publicationId", "=", id),
    db.deleteFrom("thesis").where("publicationId", "=", id),
    subtypeInsert(id, data.subtype),
    db.deleteFrom("publication_translation").where("publicationId", "=", id),
    translationsInsert(id, data.translations),
    db.deleteFrom("publication_author").where("publicationId", "=", id),
    authorsInsert(id, data.authors),
  ]);
}

export async function deletePublication(id: number) {
  await atomic([
    db.deleteFrom("publication_author").where("publicationId", "=", id),
    db.deleteFrom("journal_article").where("publicationId", "=", id),
    db.deleteFrom("conference_paper").where("publicationId", "=", id),
    db.deleteFrom("thesis").where("publicationId", "=", id),
    db.deleteFrom("publication").where("id", "=", id),
  ]);
}

export async function getJournalPublicationDependencyCount(journalId: number) {
  const row = await db
    .selectFrom("journal_article")
    .select((eb) => eb.fn.count<number>("publicationId").as("count"))
    .where("journalId", "=", journalId)
    .executeTakeFirstOrThrow();
  return Number(row.count ?? 0);
}

export async function getUniversityPublicationDependencyCount(universityId: number) {
  const row = await db
    .selectFrom("thesis")
    .select((eb) => eb.fn.count<number>("publicationId").as("count"))
    .where("universityId", "=", universityId)
    .executeTakeFirstOrThrow();
  return Number(row.count ?? 0);
}

export async function getEventPublicationDependencyCount(eventId: number) {
  const row = await db
    .selectFrom("conference_paper")
    .select((eb) => eb.fn.count<number>("publicationId").as("count"))
    .where("eventId", "=", eventId)
    .executeTakeFirstOrThrow();
  return Number(row.count ?? 0);
}
