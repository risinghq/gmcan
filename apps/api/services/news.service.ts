import { sql } from "kysely";

import { db } from "../db/client.js";
import type { NewsRow } from "../db/schema.js";
import type { LocalizedTranslations } from "../lib/admin-translations.js";
import { DEFAULT_LOCALE } from "../lib/locales.js";
import { type Locale } from "../lib/public-locale.js";
import type { AdminNewsListItem, AdminNewsListQuery, AdminNewsListResponse } from "./admin-list.types.js";
import { resolveAssetAccessUrl } from "./asset.service.js";

export interface NewsUpsertInput {
  translations: LocalizedTranslations<{ title: string; summary: string; body: string }>;
  status: number;
  publishedAt?: string;
  authorId: number;
  newsTypeId: number;
  priority?: number;
}

export type PublicNewsSortBy = "publishedAt" | "title";

export interface PublicNewsListQuery {
  q?: string;
  status: number;
  newsTypeId?: number;
  sortBy: PublicNewsSortBy;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface PublicNewsListItem {
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  asset: string | null;
  priority: number | null;
  authorId: number;
  newsTypeId: number;
  authorName: string;
  authorAsset: string | null;
  newsTypeName: string;
}

export interface PublicNewsListResponse {
  items: PublicNewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicNewsDetail {
  id: number;
  title: string;
  summary: string;
  body: string;
  status: number;
  publishedAt: string;
  asset: string | null;
  priority: number | null;
  authorId: number;
  newsTypeId: number;
  updatedAt: string | null;
  createdAt: string | null;
  authorName: string;
  authorAsset: string | null;
  newsTypeName: string;
}

function toNewsRow(data: NewsUpsertInput) {
  return {
    status: data.status,
    publishedAt: data.publishedAt,
    authorId: data.authorId,
    newsTypeId: data.newsTypeId,
    priority: data.priority,
  };
}

async function replaceNewsTranslations(
  newsId: number,
  translations: Record<string, { title: string; summary: string; body: string }>,
) {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("news_translation").where("newsId", "=", newsId).execute();
    await trx
      .insertInto("news_translation")
      .values(
        Object.entries(translations).map(([locale, tr]) => ({
          newsId,
          locale,
          title: tr.title,
          summary: tr.summary,
          body: tr.body,
        })),
      )
      .execute();
  });
}

export async function listPublicNews(locale: Locale, query: PublicNewsListQuery): Promise<PublicNewsListResponse> {
  const offset = (query.page - 1) * query.pageSize;

  let base = db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .leftJoin("news_type", "news_type.id", "news.newsTypeId")
    .leftJoin("news_type_translation", (join) =>
      join
        .onRef("news_type_translation.newsTypeId", "=", "news.newsTypeId")
        .on("news_type_translation.locale", "=", locale),
    )
    .where("news.status", "=", query.status);
  if (query.newsTypeId !== undefined) {
    base = base.where("news.newsTypeId", "=", query.newsTypeId);
  }
  if (query.q) {
    base = base.where(sql<boolean>`news.id in (
      select rowid
      from news_search
      where news_search match ${query.q}
    )`);
  }

  const totalRow = await base.select(({ fn }) => fn.count<number>("news.id").as("count")).executeTakeFirstOrThrow();

  const rows = await base
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news_translation.summary as summary",
      "news.publishedAt as publishedAt",
      "news.priority as priority",
      "news.authorId as authorId",
      "news.newsTypeId as newsTypeId",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      sql<string>`coalesce(news_type_translation.name, '')`.as("newsTypeName"),
    ])
    .$if(query.sortBy === "publishedAt", (qb) => qb.orderBy("news.publishedAt", query.sortOrder))
    .$if(query.sortBy === "title", (qb) => qb.orderBy("news_translation.title", query.sortOrder))
    .orderBy("news.id", "desc")
    .limit(query.pageSize)
    .offset(offset)
    .execute();

  return {
    items: await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        publishedAt: row.publishedAt,
        asset: await resolveAssetAccessUrl({ resourceType: "news", resourceId: row.id, slot: "photo" }),
        priority: row.priority,
        authorId: row.authorId,
        newsTypeId: row.newsTypeId,
        authorName: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
        authorAsset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.authorId, slot: "photo" }),
        newsTypeName: row.newsTypeName,
      })),
    ),
    total: Number(totalRow.count),
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getPublicNewsDetail(id: number, locale: Locale): Promise<PublicNewsDetail | null> {
  const row = await db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .leftJoin("news_type", "news_type.id", "news.newsTypeId")
    .leftJoin("news_type_translation", (join) =>
      join
        .onRef("news_type_translation.newsTypeId", "=", "news.newsTypeId")
        .on("news_type_translation.locale", "=", locale),
    )
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news_translation.summary as summary",
      "news_translation.body as body",
      "news.status as status",
      "news.publishedAt as publishedAt",
      "news.priority as priority",
      "news.authorId as authorId",
      "news.newsTypeId as newsTypeId",
      "news.updatedAt as updatedAt",
      "news.createdAt as createdAt",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      sql<string>`coalesce(news_type_translation.name, '')`.as("newsTypeName"),
    ])
    .where("news.id", "=", id)
    .executeTakeFirst();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    status: row.status,
    publishedAt: row.publishedAt,
    asset: await resolveAssetAccessUrl({ resourceType: "news", resourceId: row.id, slot: "photo" }),
    priority: row.priority,
    authorId: row.authorId,
    newsTypeId: row.newsTypeId,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
    authorName: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
    authorAsset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.authorId, slot: "photo" }),
    newsTypeName: row.newsTypeName,
  };
}

export async function listAdminNews(query: AdminNewsListQuery): Promise<AdminNewsListResponse> {
  const offset = (query.page - 1) * query.pageSize;
  let base = db
    .selectFrom("news")
    .innerJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", DEFAULT_LOCALE),
    )
    .innerJoin("news_type", "news_type.id", "news.newsTypeId")
    .leftJoin("news_type_translation", (join) =>
      join
        .onRef("news_type_translation.newsTypeId", "=", "news.newsTypeId")
        .on("news_type_translation.locale", "=", DEFAULT_LOCALE),
    )
    .innerJoin("member", "member.id", "news.authorId");
  if (query.status !== undefined) base = base.where("news.status", "=", query.status);
  if (query.newsTypeId !== undefined) base = base.where("news.newsTypeId", "=", query.newsTypeId);
  if (query.authorId !== undefined) base = base.where("news.authorId", "=", query.authorId);
  if (query.q) {
    base = base.where((eb) =>
      eb.or([
        eb("news_translation.title", "like", `%${query.q}%`),
        eb("news_translation.summary", "like", `%${query.q}%`),
        eb("member.firstName", "like", `%${query.q}%`),
        eb("member.lastName", "like", `%${query.q}%`),
        eb("member.maternalName", "like", `%${query.q}%`),
        eb("news_type_translation.name", "like", `%${query.q}%`),
      ]),
    );
  }

  const totalRow = await base.select(({ fn }) => fn.count<number>("news.id").as("count")).executeTakeFirstOrThrow();

  const rows = await base
    .select([
      "news.id as id",
      "news_translation.title as title",
      "news.publishedAt as publishedAt",
      "news.status as status",
      "news.authorId as authorId",
      "news.newsTypeId as newsTypeId",
      "news_type_translation.name as categoryName",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
    ])
    .$if(query.sortBy === "publishedAt", (qb) => qb.orderBy("news.publishedAt", query.sortOrder))
    .$if(query.sortBy === "title", (qb) => qb.orderBy("news_translation.title", query.sortOrder))
    .$if(query.sortBy === "status", (qb) => qb.orderBy("news.status", query.sortOrder))
    .$if(query.sortBy === "authorName", (qb) => qb.orderBy("member.firstName", query.sortOrder))
    .$if(query.sortBy === "categoryName", (qb) => qb.orderBy("news_type_translation.name", query.sortOrder))
    .orderBy("news.id", "desc")
    .limit(query.pageSize)
    .offset(offset)
    .execute();

  const items: AdminNewsListItem[] = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      publishedAt: row.publishedAt,
      status: row.status,
      authorId: row.authorId,
      newsTypeId: row.newsTypeId,
      statusLabel: row.status === 1 ? "Activo" : "Inactivo",
      categoryName: row.categoryName,
      authorName: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
      authorAsset: await resolveAssetAccessUrl({ resourceType: "member", resourceId: row.authorId, slot: "photo" }),
    })),
  );

  return {
    items,
    total: Number(totalRow.count),
    page: query.page,
    pageSize: query.pageSize,
  };
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
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
    priority: row.priority,
    authorId: row.authorId,
    newsTypeId: row.newsTypeId,
    translations: Object.fromEntries(
      translations.map((tr) => [tr.locale, { title: tr.title, summary: tr.summary, body: tr.body }]),
    ),
  };
}

export async function createNews(data: NewsUpsertInput) {
  const result = await db.insertInto("news").values(toNewsRow(data)).executeTakeFirstOrThrow();
  const id = Number(result.insertId);
  await replaceNewsTranslations(id, data.translations);
  return id;
}

export async function updateNews(id: number, data: NewsUpsertInput) {
  await db.updateTable("news").set(toNewsRow(data)).where("id", "=", id).execute();
  await replaceNewsTranslations(id, data.translations);
}

export async function deleteNews(id: number) {
  await db.deleteFrom("news").where("id", "=", id).execute();
}
