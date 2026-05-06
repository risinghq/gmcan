export interface AdminNewsListItem {
  id: number;
  title: string;
  publishedAt: string;
  statusCode: "draft" | "published" | "archived";
  authorId: number;
  newsKindCode: "general" | "research" | "event";
  statusLabel: string;
  categoryName: string;
  authorName: string;
  authorAsset: string | null;
}

export type AdminNewsSortBy = "publishedAt" | "title" | "statusCode" | "authorName" | "categoryName";
export type AdminListSortOrder = "asc" | "desc";

export interface AdminNewsListQuery {
  q?: string;
  statusCode?: "draft" | "published" | "archived";
  newsKindCode?: "general" | "research" | "event";
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
  fundedAmountMinor: number;
  description: string;
  statusCode: "planned" | "active" | "completed" | "archived";
  startDate: string;
  endDate: string | null;
  researchLineId: number;
  currencyCode: "pen" | "usd";
  fundingSourceCode: "vrip" | "none";
  startDateLabel: string;
  members: AdminProjectMemberListItem[];
}

export interface AdminPublicationListItem {
  id: number;
  title: string;
  publishedAt: string;
  kindCode: "journal_article" | "conference_paper" | "thesis";
  subtype: unknown;
  doi: string | null;
  publishedAtLabel: string;
  firstAuthorName: string;
  firstAuthorAsset: string | null;
}

export interface AdminMemberListItem {
  id: number;
  dni: string;
  email: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  birthDate: string | null;
  bio: string | null;
  isActive: number;
  roleCode: "administrator" | "researcher" | "visitor";
  memberTypeCode: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
  memberTypeName: string;
  prefixCode: "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none" | null;
  prefixName: string | null;
  asset: string | null;
}
