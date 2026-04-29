export interface News {
  id: number;
  title: string | null;
  titleEN: string | null;
  summary: string | null;
  summaryEN: string | null;
  body: string | null;
  bodyEN: string | null;
  status: number | null;
  publishedAt: string | null;
  photo: string | null;
  priority: number | null;
  authorId: number | null;
  newsTypeId: number | null;
  updatedAt: string | null;
  createdAt: string | null;
}
