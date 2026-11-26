export type { AdminPublicationListItem } from "@gmcan/contracts/admin";

export interface AdminNewsListItem {
  id: number;
  title: string;
  publishedAt: string;
  statusCode: "draft" | "published" | "archived";
  authorId: number;
  newsKindCode: "general" | "research" | "event";
  statusLabel: string;
  // null when the news kind has no translation in the request locale.
  categoryName: string | null;
  authorName: string;
  authorPhotoUrl: string | null;
  authorPhotoAlt: string;
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
  photoUrl: string | null;
  photoAlt: string;
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
  photoUrl: string | null;
  photoAlt: string;
}
