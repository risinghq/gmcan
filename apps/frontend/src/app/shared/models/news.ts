export interface News {
  id: number;
  title: string;
  titleEN: string;
  summary: string;
  summaryEN: string;
  body: string;
  bodyEN: string;
  status: number;
  publishedAt: string;
  photo: string | null;
  priority: number | null;
  authorId: number;
  newsTypeId: number;
  updatedAt: string | null;
  createdAt: string | null;
}
