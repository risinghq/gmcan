import { db } from "../db/client.js";
import type { NewsRow } from "../db/schema.js";
import type { Bilingual } from "../lib/admin-translations.js";

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
