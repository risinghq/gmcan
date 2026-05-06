import { db } from "../db/client.js";
import type { PublicationKindCode, ThesisKindCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { monthYearEs } from "../lib/date-label.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminPublicationListItem } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./assets/service.js";

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

export type PublicationAuthor =
  | {
      kind: "registered";
      authorOrder: number;
      memberId: number;
      name: string;
      photoUrl: string | null;
    }
  | {
      kind: "external";
      authorOrder: number;
      name: string;
    };

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
          kind: "registered" as const,
          authorOrder: row.authorOrder,
          memberId: row.memberId,
          name: nameOf(row.memberFirstName, row.memberLastName, row.memberMaternalName),
          photoUrl: await resolveAssetAccessUrl({ ownerType: "member", ownerId: row.memberId, slot: "photo" }),
        };
      }

      return {
        kind: "external" as const,
        authorOrder: row.authorOrder,
        name: row.externalName ?? "",
      };
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
      "publication.kindCode as kindCode",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
    ])
    .orderBy("publication.publishedAt", "desc")
    .execute();

  if (publications.length === 0) return [];
  const ids = publications.map((p) => p.id);
  const [subtypes, authorRows] = await Promise.all([
    subtypeByPublicationIds(ids),
    Promise.all(ids.map(async (id) => [id, await attachAuthors(id)] as const)),
  ]);
  const authorsById = new Map(authorRows);

  return publications.map((row) => ({
    id: row.id,
    kindCode: row.kindCode,
    title: row.title,
    abstract: row.abstract,
    doi: row.doi,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
    subtype: subtypes.get(row.id),
    authors: authorsById.get(row.id) ?? [],
  }));
}

export async function listAdminPublications(kindCode?: PublicationKindCode): Promise<AdminPublicationListItem[]> {
  let query = db
    .selectFrom("publication")
    .innerJoin("publication_translation", (join) =>
      join
        .onRef("publication_translation.publicationId", "=", "publication.id")
        .on("publication_translation.locale", "=", DEFAULT_LOCALE),
    )
    .select([
      "publication.id as id",
      "publication.kindCode as kindCode",
      "publication_translation.title as title",
      "publication.publishedAt as publishedAt",
      "publication.doi as doi",
    ]);

  if (kindCode) query = query.where("publication.kindCode", "=", kindCode);
  const publications = await query.orderBy("publication.publishedAt", "desc").execute();
  if (publications.length === 0) return [];

  const ids = publications.map((publication) => publication.id);
  const [subtypes, authorRows] = await Promise.all([
    subtypeByPublicationIds(ids),
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

  return publications.map((publication) => ({
    id: publication.id,
    title: publication.title,
    kindCode: publication.kindCode,
    subtype: subtypes.get(publication.id) ?? null,
    doi: publication.doi,
    publishedAt: publication.publishedAt,
    publishedAtLabel: monthYearEs(publication.publishedAt),
    firstAuthorName: firstAuthorByPublication.get(publication.id)?.name ?? "",
    firstAuthorAsset: firstAuthorByPublication.get(publication.id)?.asset ?? null,
  }));
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
      "publication.kindCode as kindCode",
      "publication_translation.title as title",
      "publication_translation.abstract as abstract",
      "publication.doi as doi",
      "publication.publishedAt as publishedAt",
      "publication.updatedAt as updatedAt",
      "publication.createdAt as createdAt",
    ])
    .where("publication.id", "=", id)
    .executeTakeFirst();
  if (!publication) return null;

  const [subtypes, authors] = await Promise.all([subtypeByPublicationIds([id]), attachAuthors(id)]);
  return { ...publication, subtype: subtypes.get(id), authors };
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

export async function listPublicationsByFilter(
  locale: Locale,
  filter: { kindCode?: PublicationKindCode; eventId?: number; journalId?: number; universityId?: number },
) {
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
      "conference_paper.eventId as eventId",
      "journal_article.journalId as journalId",
      "journal_article.issue as issue",
      "thesis.universityId as universityId",
      "thesis.thesisKindCode as thesisKindCode",
    ]);

  if (filter.kindCode) query = query.where("publication.kindCode", "=", filter.kindCode);
  if (filter.eventId) query = query.where("conference_paper.eventId", "=", filter.eventId);
  if (filter.journalId) query = query.where("journal_article.journalId", "=", filter.journalId);
  if (filter.universityId) query = query.where("thesis.universityId", "=", filter.universityId);

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
