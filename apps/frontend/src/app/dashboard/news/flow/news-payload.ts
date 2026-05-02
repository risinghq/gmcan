import type { News } from "@app/shared/models/news";
import type { NewsUpsertBody } from "@app/shared/services/news.service";

export function toNewsUpsertBody(noticia: News, status: number, publishedAt?: string): NewsUpsertBody | null {
  const title = noticia.title.trim();
  const titleEN = noticia.titleEN.trim();
  const summary = noticia.summary.trim();
  const summaryEN = noticia.summaryEN.trim();
  const body = noticia.body.trim();
  const bodyEN = noticia.bodyEN.trim();

  if (!title || !titleEN || !summary || !summaryEN || !body || !bodyEN) return null;
  if (noticia.authorId <= 0 || noticia.newsTypeId <= 0) return null;

  return {
    title,
    titleEN,
    summary,
    summaryEN,
    body,
    bodyEN,
    status,
    publishedAt,
    authorId: noticia.authorId,
    newsTypeId: noticia.newsTypeId,
  };
}
