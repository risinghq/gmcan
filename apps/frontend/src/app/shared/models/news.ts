export interface News {
  id: number;
  title: string;
  summary: string;
  body: string;
  status: number;
  publishedAt: string;
  asset: string | null;
  priority: number | null;
  authorId: number;
  newsTypeId: number;
  updatedAt: string | null;
  createdAt: string | null;
}
