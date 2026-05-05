import type { Generated, Insertable, Selectable, Updateable } from "kysely";

type DateString = string;

export interface GenderTable {
  id: Generated<number>;
  name: string;
}

export interface PrefixTable {
  id: Generated<number>;
  name: string;
}

export interface RoleTable {
  id: Generated<number>;
  name: string;
}

export interface MemberTypeTable {
  id: Generated<number>;
  name: string;
  nameEN: string;
  nameSingular: string;
  nameSingularEN: string;
}

export interface PublicationTypeTable {
  id: Generated<number>;
  name: string;
  nameEN: string;
}

export interface ThesisTypeTable {
  id: Generated<number>;
  name: string;
  nameEN: string;
}

export interface NewsTypeTable {
  id: Generated<number>;
  name: string;
  nameEN: string;
}

export interface JournalTable {
  id: Generated<number>;
  name: string;
}

export interface UniversityTable {
  id: Generated<number>;
  name: string;
  nameEN: string;
}

export interface EventTable {
  id: Generated<number>;
  name: string;
  city: string | null;
  country: string | null;
  cityEN: string | null;
  countryEN: string | null;
}

export interface FundingSourceTable {
  id: Generated<number>;
  name: string;
}

export interface CurrencyTable {
  id: Generated<number>;
  symbol: string;
}

export interface ResearchGroupTable {
  id: Generated<number>;
  summaryES: string;
  summaryEN: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  fullName: string | null;
  facilitiesES: string | null;
  facilitiesEN: string | null;
  futureWorkES: string | null;
  futureWorkEN: string | null;
  publicationsSectionES: string | null;
  publicationsSectionEN: string | null;
  projectsSectionES: string | null;
  projectsSectionEN: string | null;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface MemberTable {
  id: Generated<number>;
  dni: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  birthDate: DateString | null;
  bio: string | null;
  bioEN: string | null;

  status: number;
  resetPassword: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  roleId: number;
  memberTypeId: number;
  prefixId: number | null;
  genderId: number | null;
  resetToken: string | null;
  resetExpires: DateString | null;
}

export interface SessionTable {
  id: string;
  memberId: number;
  email: string;
  expiresAt: DateString;
  lastActive: DateString;
}

export interface ResearchLineTable {
  id: Generated<number>;
  groupId: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
}

export interface ResearchLineTranslationTable {
  id: Generated<number>;
  researchLineId: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface MethodTable {
  id: Generated<number>;
  groupId: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
}

export interface MethodTranslationTable {
  id: Generated<number>;
  methodId: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface EquipmentTable {
  id: Generated<number>;
  name: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  groupId: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
}

export interface SoftwareTable {
  id: Generated<number>;
  moreInfo: string | null;
  groupId: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
}

export interface SoftwareTranslationTable {
  id: Generated<number>;
  softwareId: number;
  locale: string;
  name: string | null;
  description: string | null;
}

export interface AboutTable {
  id: Generated<number>;
  createdAt: DateString | null;
  updatedAt: DateString | null;

  groupId: number;
}

export interface AboutTranslationTable {
  id: Generated<number>;
  aboutId: number;
  locale: string;
  description: string;
  objectivesContent: string | null;
  servicesContent: string | null;
  homeServicesTeaserContent: string | null;
}

export interface GroupTranslationTable {
  id: Generated<number>;
  groupId: number;
  locale: string;
  summary: string;
  facilities: string | null;
  futureWork: string | null;
  publicationsSection: string | null;
  projectsSection: string | null;
}

export interface NewsTable {
  id: Generated<number>;
  status: number;
  publishedAt: DateString;
  updatedAt: DateString | null;
  createdAt: DateString | null;

  priority: number | null;
  authorId: number;
  newsTypeId: number;
}

export interface NewsTranslationTable {
  id: Generated<number>;
  newsId: number;
  locale: string;
  title: string;
  summary: string;
  body: string;
}

export interface PublicationTable {
  id: Generated<number>;
  title: string;
  abstractES: string | null;
  abstractEN: string | null;
  journalIssue: number | null;
  doi: string | null;
  publishedAt: DateString;
  updatedAt: DateString | null;
  createdAt: DateString | null;
  typeId: number;
  journalId: number | null;
  universityId: number | null;
  eventId: number | null;
  thesisTypeId: number | null;
}

export interface PublicationAuthorTable {
  id: Generated<number>;
  publicationId: number;
  isPrincipal: number;
  externalName: string | null;
  memberId: number | null;
}

export interface ProjectTable {
  id: Generated<number>;
  title: string;
  titleEN: string | null;
  code: string;
  fundedAmount: string;
  description: string;
  descriptionEN: string | null;
  status: number | null;
  startDate: DateString;
  endDate: DateString | null;
  createdAt: DateString | null;
  updatedAt: DateString | null;
  researchLineId: number;
  currencyId: number;
  fundingSourceId: number;
}

export interface MemberProjectTable {
  projectId: number;
  memberId: number;
  createdAt: DateString | null;
  updatedAt: DateString | null;
}

export interface MemberGroupTable {
  memberId: number;
  groupId: number;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface AssetTable {
  id: Generated<number>;
  storageKey: string;
  bucket: string;
  mimeDetected: string;
  ext: string;
  sizeBytes: number;
  sha256: string;
  visibility: "public" | "private";
  status: "active" | "soft_deleted" | "hard_deleted" | "quarantined";
  createdBy: number | null;
  createdAt: DateString;
  deletedAt: DateString | null;
  deleteAfter: DateString | null;
}

export interface AssetBindingTable {
  id: Generated<number>;
  resourceType: string;
  resourceId: number;
  slot: string;
  assetId: number;
  isCurrent: number;
  replacedByBindingId: number | null;
  replacedAt: DateString | null;
  createdAt: DateString;
  deletedAt: DateString | null;
}

export interface AssetAuditTable {
  id: Generated<number>;
  assetId: number | null;
  bindingId: number | null;
  action: string;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}

export interface Database {
  gender: GenderTable;
  prefix: PrefixTable;
  role: RoleTable;
  member_type: MemberTypeTable;
  publication_type: PublicationTypeTable;
  thesis_type: ThesisTypeTable;
  news_type: NewsTypeTable;
  journal: JournalTable;
  university: UniversityTable;
  event: EventTable;
  funding_source: FundingSourceTable;
  currency: CurrencyTable;
  research_group: ResearchGroupTable;
  member: MemberTable;
  session: SessionTable;
  research_line: ResearchLineTable;
  research_line_translation: ResearchLineTranslationTable;
  method: MethodTable;
  method_translation: MethodTranslationTable;
  equipment: EquipmentTable;
  software: SoftwareTable;
  software_translation: SoftwareTranslationTable;
  about: AboutTable;
  about_translation: AboutTranslationTable;
  group_translation: GroupTranslationTable;
  news: NewsTable;
  news_translation: NewsTranslationTable;
  publication: PublicationTable;
  publication_author: PublicationAuthorTable;
  project: ProjectTable;
  member_project: MemberProjectTable;
  member_group: MemberGroupTable;
  asset: AssetTable;
  asset_binding: AssetBindingTable;
  asset_audit: AssetAuditTable;
}

export type ProjectRow = Selectable<ProjectTable>;
export type ProjectInsert = Insertable<ProjectTable>;
export type ProjectUpdate = Updateable<ProjectTable>;

export type NewsRow = Selectable<NewsTable>;
export type NewsInsert = Insertable<NewsTable>;
export type NewsUpdate = Updateable<NewsTable>;

export type ResearchLineRow = Selectable<ResearchLineTable>;
export type ResearchLineInsert = Insertable<ResearchLineTable>;
export type ResearchLineUpdate = Updateable<ResearchLineTable>;

export type MethodRow = Selectable<MethodTable>;
export type MethodInsert = Insertable<MethodTable>;
export type MethodUpdate = Updateable<MethodTable>;
