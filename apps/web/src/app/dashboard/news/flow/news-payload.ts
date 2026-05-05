import type { News } from "@app/shared/models/news";
import type { NewsUpsertBody } from "@app/shared/services/news.service";

export function toNewsUpsertBody(noticia: News, status: number, publishedAt?: string): NewsUpsertBody | null {
  const title = noticia.title.trim();
  const summary = noticia.summary.trim();
  const body = noticia.body.trim();

  if (!title || !summary || !body) return null;
  if (noticia.authorId <= 0 || noticia.newsTypeId <= 0) return null;

  return {
    title,
    summary,
    body,
    status,
    publishedAt,
    authorId: noticia.authorId,
    newsTypeId: noticia.newsTypeId,
  };
}
