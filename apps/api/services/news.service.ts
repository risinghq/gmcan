import type { RawBuilder } from "kysely";

import { atomic, db, insertedId, lastInsertId } from "../db/client.js";
import type { NewsRow, NewsStatusCode } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { type Locale } from "../lib/public-locale.js";
import { newsSearchFilter } from "../repositories/news.js";
import type { AdminNewsListItem, AdminNewsListQuery, AdminNewsListResponse } from "./admin-list.types.js";
import { resolveAssetAccessUrl, resolveAssetAccessUrls } from "./assets/service.js";
import { resolveMemberPhotoViews } from "./member-photo.service.js";

export interface NewsUpsertInput {
  translations: LocalizedTranslations<{ title: string; summary: string; body: string }>;
  statusCode: NewsStatusCode;
  publishedAt?: string;
  authorId: number;
  newsKindCode: "general" | "research" | "event";
  priority?: number;
}

export type PublicNewsSortBy = "publishedAt" | "title";

export interface PublicNewsListQuery {
  q?: string;
  newsKindCode?: "general" | "research" | "event";
  sortBy: PublicNewsSortBy;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

function statusLabel(statusCode: NewsStatusCode): string {
  if (statusCode === "published") return "Publicado";
  if (statusCode === "draft") return "Borrador";
  return "Archivado";
}

type NewsAuthorRow = {
  authorId: number;
  firstName: string | null;
  lastName: string | null;
  maternalName: string | null;
};

/** Names and photos of every author in the rows, with one asset query for all of them. */
async function resolveNewsAuthors(rows: NewsAuthorRow[], locale: Locale) {
  const names = new Map(
    rows.map((row) => [row.authorId, [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" ")]),
  );
  const photos = await resolveMemberPhotoViews(
    [...names].map(([memberId, fullName]) => ({ memberId, fullName })),
    locale,
  );
  return new Map(
    [...names].map(([authorId, authorName]) => {
      const photo = photos.get(authorId)!;
      return [authorId, { authorName, authorPhotoUrl: photo.photoUrl, authorPhotoAlt: photo.photoAlt }];
    }),
  );
}

async function resolveNewsAuthor(row: NewsAuthorRow, locale: Locale) {
  return (await resolveNewsAuthors([row], locale)).get(row.authorId)!;
}

function toNewsRow(data: NewsUpsertInput) {
  return {
    statusCode: data.statusCode,
    publishedAt: data.publishedAt,
    authorId: data.authorId,
    newsKindCode: data.newsKindCode,
    priority: data.priority,
  };
}

function insertNewsTranslations(newsId: number | RawBuilder<number>, translations: NewsUpsertInput["translations"]) {
  return db.insertInto("news_translation").values(
    Object.entries(translations).map(([locale, tr]) => ({
      newsId,
      locale,
      title: tr.title,
      summary: tr.summary,
      body: tr.body,
    })),
  );
}

export async function listPublicNews(locale: Locale, query: PublicNewsListQuery) {
  const offset = (query.page - 1) * query.pageSize;

  let base = db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .leftJoin("news_kind", "news_kind.code", "news.newsKindCode")
    .leftJoin("news_kind_translation", (join) =>
      join
        .onRef("news_kind_translation.newsKindCode", "=", "news.newsKindCode")
        .on("news_kind_translation.locale", "=", locale),
    )
    .where("news.statusCode", "=", "published");

  if (query.newsKindCode !== undefined) base = base.where("news.newsKindCode", "=", query.newsKindCode);

  const search = newsSearchFilter(locale, query.q ?? "");
  if (search) base = base.where(search);

  const totalRow = await base.select(({ fn }) => fn.count<number>("news.id").as("count")).executeTakeFirstOrThrow();

  const rows = await base
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news_translation.summary as summary",
      "news.publishedAt as publishedAt",
      "news.priority as priority",
      "news.authorId as authorId",
      "news.newsKindCode as newsKindCode",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "news_kind_translation.name as newsKindName",
    ])
    .$if(query.sortBy === "publishedAt", (qb) => qb.orderBy("news.publishedAt", query.sortOrder))
    .$if(query.sortBy === "title", (qb) => qb.orderBy("news_translation.title", query.sortOrder))
    .orderBy("news.id", "desc")
    .limit(query.pageSize)
    .offset(offset)
    .execute();

  const [authors, assets] = await Promise.all([
    resolveNewsAuthors(rows, locale),
    resolveAssetAccessUrls({ ownerType: "news", ownerIds: rows.map((row) => row.id), slot: "photo" }),
  ]);

  return {
    items: rows.map((row) => {
      const author = authors.get(row.authorId)!;
      return {
        id: row.id,
        title: row.title,
        summary: row.summary,
        publishedAt: row.publishedAt,
        asset: assets.get(row.id) ?? null,
        priority: row.priority,
        authorId: row.authorId,
        newsKindCode: row.newsKindCode,
        authorName: author.authorName,
        authorPhotoUrl: author.authorPhotoUrl,
        authorPhotoAlt: author.authorPhotoAlt,
        newsKindName: row.newsKindName ?? "",
      };
    }),
    total: Number(totalRow.count),
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getPublicNewsDetail(id: number, locale: Locale) {
  const row = await db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .leftJoin("news_kind", "news_kind.code", "news.newsKindCode")
    .leftJoin("news_kind_translation", (join) =>
      join
        .onRef("news_kind_translation.newsKindCode", "=", "news.newsKindCode")
        .on("news_kind_translation.locale", "=", locale),
    )
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news_translation.summary as summary",
      "news_translation.body as body",
      "news.statusCode as statusCode",
      "news.publishedAt as publishedAt",
      "news.priority as priority",
      "news.authorId as authorId",
      "news.newsKindCode as newsKindCode",
      "news.updatedAt as updatedAt",
      "news.createdAt as createdAt",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "news_kind_translation.name as newsKindName",
    ])
    .where("news.id", "=", id)
    .where("news.statusCode", "=", "published")
    .executeTakeFirst();

  if (!row) return null;

  return {
    ...row,
    asset: await resolveAssetAccessUrl({ ownerType: "news", ownerId: row.id, slot: "photo" }),
    ...(await resolveNewsAuthor(row, locale)),
    newsKindName: row.newsKindName ?? "",
  };
}

export async function listAdminNews(locale: Locale, query: AdminNewsListQuery): Promise<AdminNewsListResponse> {
  const offset = (query.page - 1) * query.pageSize;
  let base = db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .innerJoin("news_kind", "news_kind.code", "news.newsKindCode")
    .leftJoin("news_kind_translation", (join) =>
      join
        .onRef("news_kind_translation.newsKindCode", "=", "news.newsKindCode")
        .on("news_kind_translation.locale", "=", locale),
    )
    .innerJoin("member", "member.id", "news.authorId");

  if (query.statusCode !== undefined) base = base.where("news.statusCode", "=", query.statusCode);
  if (query.newsKindCode !== undefined) base = base.where("news.newsKindCode", "=", query.newsKindCode);
  if (query.authorId !== undefined) base = base.where("news.authorId", "=", query.authorId);
  const search = newsSearchFilter(locale, query.q ?? "");
  if (search) base = base.where(search);

  const totalRow = await base.select(({ fn }) => fn.count<number>("news.id").as("count")).executeTakeFirstOrThrow();

  const rows = await base
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news.publishedAt as publishedAt",
      "news.statusCode as statusCode",
      "news.authorId as authorId",
      "news.newsKindCode as newsKindCode",
      "news_kind_translation.name as categoryName",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
    ])
    .$if(query.sortBy === "publishedAt", (qb) => qb.orderBy("news.publishedAt", query.sortOrder))
    .$if(query.sortBy === "title", (qb) => qb.orderBy("news_translation.title", query.sortOrder))
    .$if(query.sortBy === "statusCode", (qb) => qb.orderBy("news.statusCode", query.sortOrder))
    .$if(query.sortBy === "authorName", (qb) => qb.orderBy("member.firstName", query.sortOrder))
    .$if(query.sortBy === "categoryName", (qb) => qb.orderBy("news_kind_translation.name", query.sortOrder))
    .orderBy("news.id", "desc")
    .limit(query.pageSize)
    .offset(offset)
    .execute();

  const authors = await resolveNewsAuthors(rows, locale);
  const items: AdminNewsListItem[] = rows.map((row) => {
    const author = authors.get(row.authorId)!;
    return {
      id: row.id,
      title: row.title,
      publishedAt: row.publishedAt,
      statusCode: row.statusCode,
      authorId: row.authorId,
      newsKindCode: row.newsKindCode,
      statusLabel: statusLabel(row.statusCode),
      categoryName: row.categoryName,
      authorName: author.authorName,
      authorPhotoUrl: author.authorPhotoUrl,
      authorPhotoAlt: author.authorPhotoAlt,
    };
  });

  return { items, total: Number(totalRow.count), page: query.page, pageSize: query.pageSize };
}

export async function getNewsItem(id: number) {
  return db.selectFrom("news").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function toAdminNewsView(row: NewsRow) {
  const translations = await db
    .selectFrom("news_translation")
    .select(["locale", "title", "summary", "body"])
    .where("newsId", "=", row.id)
    .execute();

  return {
    id: row.id,
    statusCode: row.statusCode,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
    priority: row.priority,
    authorId: row.authorId,
    newsKindCode: row.newsKindCode,
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { title: tr.title, summary: tr.summary, body: tr.body }]),
    ),
  };
}

export async function createNews(data: NewsUpsertInput) {
  const now = new Date().toISOString();
  const results = await atomic([
    db
      .insertInto("news")
      .values({ ...toNewsRow(data), publishedAt: data.publishedAt ?? now, createdAt: now, updatedAt: now }),
    insertNewsTranslations(lastInsertId("news"), data.translations),
  ]);
  return insertedId(results, 0);
}

export async function updateNews(id: number, data: NewsUpsertInput) {
  const now = new Date().toISOString();
  await atomic([
    db
      .updateTable("news")
      .set({ ...toNewsRow(data), updatedAt: now })
      .where("id", "=", id),
    db.deleteFrom("news_translation").where("newsId", "=", id),
    insertNewsTranslations(id, data.translations),
  ]);
}

export async function deleteNews(id: number) {
  await db.deleteFrom("news").where("id", "=", id).execute();
}
