export interface AdminNewsListItem {
  id: number;
  title: string;
  publishedAt: string;
  status: number;
  authorId: number;
  newsTypeId: number;
  statusLabel: string;
  categoryName: string;
  authorName: string;
  authorAsset: string | null;
}

export type AdminNewsSortBy = "publishedAt" | "title" | "status" | "authorName" | "categoryName";
export type AdminListSortOrder = "asc" | "desc";

export interface AdminNewsListQuery {
  q?: string;
  status?: number;
  newsTypeId?: number;
  authorId?: number;
  sortBy: AdminNewsSortBy;
  sortOrder: AdminListSortOrder;
  page: number;
  pageSize: number;
}

export interface AdminNewsListResponse {
  items: AdminNewsListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminProjectMemberListItem {
  memberId: number;
  name: string;
  asset: string | null;
}

export interface AdminProjectListItem {
  id: number;
  title: string;
  code: string;
  fundedAmount: string;
  description: string;
  status: number | null;
  startDate: string;
  endDate: string | null;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
  members: AdminProjectMemberListItem[];
}

export interface AdminPublicationListItem {
  id: number;
  title: string;
  publishedAt: string;
  typeId: number;
  journalId: number | null;
  universityId: number | null;
  thesisTypeId: number | null;
  doi: string | null;
  eventId: number | null;
  eventName: string;
  firstAuthorName: string;
  firstAuthorAsset: string | null;
}
