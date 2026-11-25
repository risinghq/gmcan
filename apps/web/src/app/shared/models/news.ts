export interface PublicNewsListItem {
  id: number;
  title: string;
  summary: string;
  publishedAt: string;
  asset: string | null;
  priority: number | null;
  authorId: number;
  newsKindCode: "general" | "research" | "event";
  authorName: string;
  authorPhotoUrl: string;
  authorPhotoAlt: string;
  newsKindName: string;
}

export interface PublicNewsListQuery {
  q?: string;
  newsKindCode?: "general" | "research" | "event";
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
  statusCode: "draft" | "published" | "archived";
  updatedAt: string | null;
  createdAt: string | null;
}
