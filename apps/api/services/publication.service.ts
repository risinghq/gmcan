import type { PublicationAuthor, PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import type { AdminPublicationListItem, AdminPublicationSubtype } from "@gmcan/contracts/admin";

import { db } from "../db/client.js";
import type { PublicationKindCode, ThesisKindCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import { resolveAssetAccessLinks, resolveAssetAccessUrl } from "./assets/service.js";

export interface AuthorInput {
  kind: "registered" | "external";
  authorOrder: number;
  memberId?: number;
  externalName?: string;
}

export type PublicationSubtypeInput =
  | { kindCode: "journal_article"; journalArticle: { journalId?: number; issue?: number } }
  | { kindCode: "conference_paper"; conferencePaper: { eventId: number } }
  | { kindCode: "thesis"; thesis: { universityId: number; thesisKindCode: ThesisKindCode } };

export interface PublicationFields {
  translations: LocalizedTranslations<{ title: string; abstract?: string }>;
  doi?: string;
  publishedAt: string;
  subtype: PublicationSubtypeInput;
}

export interface PublicPublicationFilter {
  id?: number;
  kindCode?: PublicationKindCode;
  eventId?: number;
  journalId?: number;
  universityId?: number;
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

async function attachAuthors(publicationId: number): Promise<PublicationAuthor[]> {
  const rows = await db
    .selectFrom("publication_author")
    .leftJoin("member", "member.id", "publication_author.memberId")
    .select([
      "publication_author.authorOrder",
      "publication_author.externalName",
      "publication_author.memberId",
      "member.firstName as memberFirstName",
      "member.lastName as memberLastName",
      "member.maternalName as memberMaternalName",
    ])
    .where("publication_author.publicationId", "=", publicationId)
    .orderBy("publication_author.authorOrder", "asc")
    .execute();

  return Promise.all(
    rows.map(async (row) => {
      if (row.memberId) {
        return {
          kind: "registered",
          authorOrder: row.authorOrder,
          memberId: row.memberId,
          name: nameOf(row.memberFirstName, row.memberLastName, row.memberMaternalName),
          asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: row.memberId, slot: "photo" }),
        } satisfies PublicationAuthor;
      }

      return {
        kind: "external",
        authorOrder: row.authorOrder,
        name: row.externalName ?? "",
      } satisfies PublicationAuthor;
    }),
  );
}

async function subtypeByPublicationIds(publicationIds: number[]) {
  const [journalRows, conferenceRows, thesisRows] = await Promise.all([
    db.selectFrom("journal_article").selectAll().where("publicationId", "in", publicationIds).execute(),
    db.selectFrom("conference_paper").selectAll().where("publicationId", "in", publicationIds).execute(),
    db.selectFrom("thesis").selectAll().where("publicationId", "in", publicationIds).execute(),
  ]);

  const subtypes = new Map<number, PublicationSubtypeInput>();
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
    db
      .selectFrom("journal_article")
      .leftJoin("journal", "journal.id", "journal_article.journalId")
      .select([
        "journal_article.publicationId as publicationId",
        "journal_article.journalId as journalId",
        "journal.name as journalName",
        "journal_article.issue as issue",
      ])
      .where("journal_article.publicationId", "in", publicationIds)
      .execute(),
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
      .where("conference_paper.publicationId", "in", publicationIds)
      .execute(),
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
      .where("thesis.publicationId", "in", publicationIds)
      .execute(),
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

  const publications = await query.orderBy("publication.publishedAt", "desc").execute();

  if (publications.length === 0) return [];
  const ids = publications.map((p) => p.id);
  const [subtypes, authorRows] = await Promise.all([
    subtypeByPublicationIds(ids),
    Promise.all(ids.map(async (id) => [id, await attachAuthors(id)] as const)),
  ]);
  const authorsById = new Map(authorRows);

  return Promise.all(
    publications.map(async (row) => {
      const subtype = subtypes.get(row.id);
      if (!subtype) throw new Error(`Publication ${row.id} is missing subtype data`);

      return {
        id: row.id,
        kindCode: row.kindCode,
        title: row.title,
        asset: await resolveAssetAccessLinks({ ownerType: "publication", ownerId: row.id, slot: "file" }),
        abstract: row.abstract,
        doi: row.doi,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        subtype,
        authors: authorsById.get(row.id) ?? [],
      } satisfies PublicPublicationWithAuthors;
    }),
  );
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
      .where("publication_author.publicationId", "in", ids)
      .orderBy("publication_author.publicationId", "asc")
      .orderBy("publication_author.authorOrder", "asc")
      .execute(),
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
  const firstAuthorEntries = await Promise.all(
    Array.from(firstAuthorRowsByPublication.entries()).map(async ([publicationId, row]) => {
      if (!row.memberId) return [publicationId, { name: row.externalName ?? "", asset: null }] as const;
      return [
        publicationId,
        {
          name: nameOf(row.firstName, row.lastName, row.maternalName),
          asset: await resolveAssetAccessUrl({ ownerType: "member", ownerId: row.memberId, slot: "photo" }),
        },
      ] as const;
    }),
  );
  const firstAuthorByPublication = new Map(firstAuthorEntries);

  return publications.map((publication) => {
    const subtype = subtypes.get(publication.id);
    if (!subtype) throw new Error(`Publication ${publication.id} is missing admin subtype data`);
    const eventName = subtype.kindCode === "conference_paper" ? subtype.conferencePaper.eventName : "";
    const journalName = subtype.kindCode === "journal_article" ? subtype.journalArticle.journalName : "";
    const universityName = subtype.kindCode === "thesis" ? subtype.thesis.universityName : "";
    const thesisKindName = subtype.kindCode === "thesis" ? subtype.thesis.thesisKindName : "";

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
      firstAuthorName: firstAuthorByPublication.get(publication.id)?.name ?? "",
      firstAuthorAsset: firstAuthorByPublication.get(publication.id)?.asset ?? null,
    };
  });
}

export async function getPublication(id: number, locale: Locale) {
  return (await listPublications(locale, { id }))[0] ?? null;
}

export async function getPublicationEditView(id: number) {
  const publication = await db.selectFrom("publication").selectAll().where("id", "=", id).executeTakeFirst();
  if (!publication) return { publication: null, authors: [] as PublicationAuthor[] };

  const [translations, subtypes, authors] = await Promise.all([
    db
      .selectFrom("publication_translation")
      .select(["locale", "title", "abstract"])
      .where("publicationId", "=", id)
      .execute(),
    subtypeByPublicationIds([id]),
    attachAuthors(id),
  ]);

  return {
    publication: {
      ...publication,
      subtype: subtypes.get(id),
      translations: Object.fromEntries(
        translations.map((tr) => [tr.locale, { title: tr.title, abstract: tr.abstract ?? undefined }]),
      ),
    },
    authors,
  };
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
    .select(["publication.id", "publication.kindCode", "publication.doi", "publication.publishedAt"])
    .where((eb) =>
      eb.or([eb("publication_translation.title", "like", like), eb("publication_translation.abstract", "like", like)]),
    )
    .execute();
}

export async function createPublication(data: PublicationFields, authors: AuthorInput[]) {
  return db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto("publication")
      .values({
        kindCode: data.subtype.kindCode,
        doi: data.doi ?? null,
        publishedAt: data.publishedAt,
      })
      .executeTakeFirstOrThrow();
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

    if (data.subtype.kindCode === "journal_article") {
      await trx
        .insertInto("journal_article")
        .values({
          publicationId: id,
          journalId: data.subtype.journalArticle.journalId ?? null,
          issue: data.subtype.journalArticle.issue ?? null,
        })
        .execute();
    } else if (data.subtype.kindCode === "conference_paper") {
      await trx
        .insertInto("conference_paper")
        .values({ publicationId: id, eventId: data.subtype.conferencePaper.eventId })
        .execute();
    } else {
      await trx
        .insertInto("thesis")
        .values({
          publicationId: id,
          universityId: data.subtype.thesis.universityId,
          thesisKindCode: data.subtype.thesis.thesisKindCode,
        })
        .execute();
    }

    if (authors.length > 0) {
      await trx
        .insertInto("publication_author")
        .values(
          authors.map((a) => ({
            publicationId: id,
            authorOrder: a.authorOrder,
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
    await trx
      .updateTable("publication")
      .set({
        kindCode: data.subtype.kindCode,
        doi: data.doi ?? null,
        publishedAt: data.publishedAt,
      })
      .where("id", "=", id)
      .execute();

    await trx.deleteFrom("journal_article").where("publicationId", "=", id).execute();
    await trx.deleteFrom("conference_paper").where("publicationId", "=", id).execute();
    await trx.deleteFrom("thesis").where("publicationId", "=", id).execute();

    if (data.subtype.kindCode === "journal_article") {
      await trx
        .insertInto("journal_article")
        .values({
          publicationId: id,
          journalId: data.subtype.journalArticle.journalId ?? null,
          issue: data.subtype.journalArticle.issue ?? null,
        })
        .execute();
    } else if (data.subtype.kindCode === "conference_paper") {
      await trx
        .insertInto("conference_paper")
        .values({ publicationId: id, eventId: data.subtype.conferencePaper.eventId })
        .execute();
    } else {
      await trx
        .insertInto("thesis")
        .values({
          publicationId: id,
          universityId: data.subtype.thesis.universityId,
          thesisKindCode: data.subtype.thesis.thesisKindCode,
        })
        .execute();
    }

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
            authorOrder: a.authorOrder,
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
    await trx.deleteFrom("journal_article").where("publicationId", "=", id).execute();
    await trx.deleteFrom("conference_paper").where("publicationId", "=", id).execute();
    await trx.deleteFrom("thesis").where("publicationId", "=", id).execute();
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
            authorOrder: a.authorOrder,
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
