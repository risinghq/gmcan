import type { Sitemap } from "@gmcan/contracts/public";

import { db } from "../db/client.js";
import { publicLocalizedMemberSelectQuery } from "./member-read-model.js";

export async function listSitemapEntries(): Promise<Sitemap> {
  const [news, members] = await Promise.all([
    db.selectFrom("news").select(["id", "updatedAt"]).where("statusCode", "=", "published").orderBy("id").execute(),
    publicLocalizedMemberSelectQuery("es")
      .clearSelect()
      .select(["member.id as id", "member.updatedAt as updatedAt"])
      .orderBy("member.id")
      .execute(),
  ]);
  return { news, members };
}
