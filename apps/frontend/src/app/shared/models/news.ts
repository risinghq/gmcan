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

export interface PublicNewsListItem {
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  asset: string | null;
  priority: number | null;
  authorId: number;
  newsTypeId: number;
  authorName: string;
  authorAsset: string | null;
  newsTypeName: string;
}

export interface PublicNewsListQuery {
  q?: string;
  status?: number;
  newsTypeId?: number;
  sortBy?: "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PublicNewsListResponse {
  items: PublicNewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicNewsDetail extends PublicNewsListItem {
  body: string;
  status: number;
  updatedAt: string | null;
  createdAt: string | null;
}
