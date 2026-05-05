import { db } from "../db/client.js";
import type { NewsRow } from "../db/schema.js";
import type { Bilingual } from "../lib/admin-translations.js";
import { assetUrl } from "../lib/upload.js";
import type {
  AdminNewsListItem,
  AdminNewsListQuery,
  AdminNewsListResponse,
  AdminNewsSortBy,
} from "./admin-list.types.js";

export interface NewsUpsertInput {
  translations: Bilingual<{ title: string; summary: string; body: string }>;
  status: number;
  publishedAt?: string;
  authorId: number;
  newsTypeId: number;
  priority?: number;
}

function toNewsRow(data: NewsUpsertInput) {
  return {
    title: data.translations.es.title,
    titleEN: data.translations.en.title,
    summary: data.translations.es.summary,
    summaryEN: data.translations.en.summary,
    body: data.translations.es.body,
    bodyEN: data.translations.en.body,
    status: data.status,
    publishedAt: data.publishedAt,
    authorId: data.authorId,
    newsTypeId: data.newsTypeId,
    priority: data.priority,
  };
}

export async function listNews(status?: number) {
  let query = db.selectFrom("news").selectAll();
  if (status !== undefined) query = query.where("status", "=", status);
  return query.orderBy("publishedAt", "desc").execute();
}

const NEWS_SORT_COLUMN: Record<AdminNewsSortBy, string> = {
  publishedAt: "news.publishedAt",
  title: "news.title",
  status: "news.status",
  authorName: "member.firstName",
  categoryName: "news_type.name",
};

export async function listAdminNews(query: AdminNewsListQuery): Promise<AdminNewsListResponse> {
  const offset = (query.page - 1) * query.pageSize;
  let base = db
    .selectFrom("news")
    .innerJoin("news_type", "news_type.id", "news.newsTypeId")
    .innerJoin("member", "member.id", "news.authorId")
    .$if(query.status !== undefined, (qb) => qb.where("news.status", "=", query.status as number))
    .$if(query.newsTypeId !== undefined, (qb) => qb.where("news.newsTypeId", "=", query.newsTypeId as number))
    .$if(query.authorId !== undefined, (qb) => qb.where("news.authorId", "=", query.authorId as number))
    .$if(Boolean(query.q), (qb) =>
      qb.where((eb) =>
        eb.or([
          eb("news.title", "like", `%${query.q}%`),
          eb("news.summary", "like", `%${query.q}%`),
          eb("member.firstName", "like", `%${query.q}%`),
          eb("member.lastName", "like", `%${query.q}%`),
          eb("member.maternalName", "like", `%${query.q}%`),
          eb("news_type.name", "like", `%${query.q}%`),
        ]),
      ),
    );

  const totalRow = await base.select(({ fn }) => fn.count<number>("news.id").as("count")).executeTakeFirstOrThrow();

  const rows = await base
    .select([
      "news.id as id",
      "news.title as title",
      "news.publishedAt as publishedAt",
      "news.status as status",
      "news.authorId as authorId",
      "news.newsTypeId as newsTypeId",
      "news_type.name as categoryName",
      "member.firstName as firstName",
      "member.lastName as lastName",
      "member.maternalName as maternalName",
      "member.photo as authorPhoto",
    ])
    .orderBy(NEWS_SORT_COLUMN[query.sortBy] as any, query.sortOrder)
    .orderBy("news.id", "desc")
    .limit(query.pageSize)
    .offset(offset)
    .execute();

  const items: AdminNewsListItem[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    publishedAt: row.publishedAt,
    status: row.status,
    authorId: row.authorId,
    newsTypeId: row.newsTypeId,
    statusLabel: row.status === 1 ? "Activo" : "Inactivo",
    categoryName: row.categoryName,
    authorName: [row.firstName, row.lastName, row.maternalName].filter(Boolean).join(" "),
    authorAsset: assetUrl(row.authorPhoto),
  }));

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

export function toAdminNewsView(row: NewsRow) {
  return {
    id: row.id,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
    photo: row.photo,
    priority: row.priority,
    authorId: row.authorId,
    newsTypeId: row.newsTypeId,
    translations: {
      es: { title: row.title, summary: row.summary, body: row.body },
      en: { title: row.titleEN, summary: row.summaryEN, body: row.bodyEN },
    },
  };
}

export async function createNews(data: NewsUpsertInput) {
  const result = await db.insertInto("news").values(toNewsRow(data)).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateNews(id: number, data: NewsUpsertInput) {
  await db.updateTable("news").set(toNewsRow(data)).where("id", "=", id).execute();
}

export async function deleteNews(id: number) {
  await db.deleteFrom("news").where("id", "=", id).execute();
}

export async function getNewsPhoto(id: number) {
  return db.selectFrom("news").select("photo").where("id", "=", id).executeTakeFirst();
}

export async function setNewsPhoto(id: number, photo: string) {
  await db.updateTable("news").set({ photo }).where("id", "=", id).execute();
}

export async function clearNewsPhoto(id: number) {
  await db.updateTable("news").set({ photo: null }).where("id", "=", id).execute();
}
