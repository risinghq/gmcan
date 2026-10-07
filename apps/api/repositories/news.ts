import { sql } from "kysely";

import { db } from "../db/client.js";
import { ftsPrefixQuery } from "../lib/fts.js";
import type { Locale } from "../lib/public-locale.js";

type NewsFtsColumn = "title" | "summary" | "authorName" | "kindName";

/** A filter on `news.id` for news whose `locale` text matches `q`, or null when `q` has no word. */
export function newsSearchFilter(locale: Locale, q: string, columns?: readonly NewsFtsColumn[]) {
  const match = ftsPrefixQuery(q, columns);
  if (!match) return null;
  return sql<boolean>`news.id in (select newsId from news_fts where news_fts match ${match} and locale = ${locale})`;
}

export async function searchNewsRows(locale: Locale, q: string) {
  const filter = newsSearchFilter(locale, q, ["title", "summary"]);
  if (!filter) return [];
  return db
    .selectFrom("news")
    .leftJoin("news_translation", (join) =>
      join.onRef("news_translation.newsId", "=", "news.id").on("news_translation.locale", "=", locale),
    )
    .leftJoin("member", "member.id", "news.authorId")
    .select([
      "news.id",
      "news_translation.title as title",
      "news.publishedAt",
      "news.authorId",
      "news.newsKindCode",
      "news.statusCode",
      "member.firstName as authorFirstName",
      "member.lastName as authorLastName",
    ])
    .where(filter)
    .where("news.statusCode", "=", "published")
    .execute();
}
