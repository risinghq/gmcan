import type { News } from "@app/shared/models/news";
import type { NewsUpsertBody } from "@app/shared/services/news.service";

export function toNewsUpsertBody(
  noticia: News,
  statusCode: "draft" | "published" | "archived",
  publishedAt?: string,
): NewsUpsertBody | null {
  const title = noticia.title.trim();
  const summary = noticia.summary.trim();
  const body = noticia.body.trim();

  if (!title || !summary || !body) return null;
  if (noticia.authorId <= 0) return null;

  return {
    statusCode,
    publishedAt,
    authorId: noticia.authorId,
    newsKindCode: noticia.newsKindCode,
    translations: { es: { title, summary, body } },
  };
}
