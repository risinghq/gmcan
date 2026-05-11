import { db } from "../db/client.js";
import type { Locale } from "../lib/public-locale.js";

export async function searchNewsRows(locale: Locale, like: string) {
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
    .where((eb) => eb.or([eb("news_translation.title", "like", like), eb("news_translation.summary", "like", like)]))
    .execute();
}
