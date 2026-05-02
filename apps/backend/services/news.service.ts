import { db } from "../db/client.js";

export interface NewsUpsertInput {
  title: string;
  titleEN: string;
  summary: string;
  summaryEN: string;
  body: string;
  bodyEN: string;
  status: number;
  publishedAt?: string;
  authorId: number;
  newsTypeId: number;
  priority?: number;
}

export async function listNews(status?: number) {
  let query = db.selectFrom("news").selectAll();
  if (status !== undefined) query = query.where("status", "=", status);
  return query.orderBy("publishedAt", "desc").execute();
}

export async function getNewsItem(id: number) {
  return db.selectFrom("news").selectAll().where("id", "=", id).executeTakeFirst();
}

export async function createNews(data: NewsUpsertInput) {
  const result = await db.insertInto("news").values(data).executeTakeFirst();
  return Number(result.insertId);
}

export async function updateNews(id: number, data: NewsUpsertInput) {
  await db.updateTable("news").set(data).where("id", "=", id).execute();
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
