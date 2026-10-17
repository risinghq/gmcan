import type { ColumnType, Generated, InsertType, Selectable, SelectType, UpdateType } from "kysely";

export type DateString = string;
export type LocaleCode = string;

export type RoleCode = "administrator" | "researcher" | "visitor";
export type MemberTypeCode = "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
export type GenderCode = "male" | "female";
export type PrefixCode = "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none";
export type PublicationKindCode = "journal_article" | "conference_paper" | "thesis";
export type ThesisKindCode = "phd" | "masters";
export type NewsKindCode = "general" | "research" | "event";
export type CurrencyCode = "pen" | "usd";
export type FundingSourceCode = "vrip" | "none";
export type NewsStatusCode = "draft" | "published" | "archived";
export type ProjectStatusCode = "planned" | "active" | "completed" | "archived";
export type AssetVisibility = "public" | "private";
export type AssetLifecycleStatus = "active" | "soft_deleted";

export interface LocaleTable {
  code: LocaleCode;
}

export interface CodeTable<TCode extends string = string> {
  code: TCode;
}

export interface GenderTable extends CodeTable<GenderCode> {
  name: string;
}
export interface PrefixTable extends CodeTable<PrefixCode> {
  label: string;
}
export interface RoleTable extends CodeTable<RoleCode> {
  name: string;
}
export interface MemberTypeTable extends CodeTable<MemberTypeCode> {}
export interface MemberTypeTranslationTable {
  memberTypeCode: MemberTypeCode;
  locale: LocaleCode;
  name: string;
  nameSingular: string;
}
export interface PublicationKindTable extends CodeTable<PublicationKindCode> {}
export interface PublicationKindTranslationTable {
  publicationKindCode: PublicationKindCode;
  locale: LocaleCode;
  name: string;
}
export interface ThesisKindTable extends CodeTable<ThesisKindCode> {}
export interface ThesisKindTranslationTable {
  thesisKindCode: ThesisKindCode;
  locale: LocaleCode;
  name: string;
}
export interface NewsKindTable extends CodeTable<NewsKindCode> {}
export interface NewsKindTranslationTable {
  newsKindCode: NewsKindCode;
  locale: LocaleCode;
  name: string;
}
export interface CurrencyTable extends CodeTable<CurrencyCode> {
  symbol: string;
}
export interface FundingSourceTable extends CodeTable<FundingSourceCode> {
  name: string;
}

export interface JournalTable {
  id: Generated<number>;
  name: string;
}
export interface UniversityTable {
  id: Generated<number>;
}
export interface UniversityTranslationTable {
  universityId: number;
  locale: LocaleCode;
  name: string;
}
export interface EventTable {
  id: Generated<number>;
}
export interface EventTranslationTable {
  eventId: number;
  locale: LocaleCode;
  name: string;
  city: string | null;
  country: string | null;
}

export interface ResearchGroupTable {
  id: Generated<number>;
  slug: string;
  shortName: string;
  fullName: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface ResearchGroupTranslationTable {
  groupId: number;
  locale: LocaleCode;
  summary: string;
  facilities: string | null;
  futureWork: string | null;
  publicationsSection: string | null;
  projectsSection: string | null;
}

export interface MemberTable {
  id: Generated<number>;
  dni: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  birthDate: DateString | null;
  isActive: number;
  roleCode: RoleCode;
  memberTypeCode: MemberTypeCode;
  prefixCode: PrefixCode | null;
  genderCode: GenderCode | null;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface MemberTranslationTable {
  memberId: number;
  locale: LocaleCode;
  bio: string | null;
}
export interface SessionTable {
  id: string;
  memberId: number;
  expiresAt: DateString;
  lastActiveAt: DateString;
}
export interface PasswordResetTable {
  tokenHash: string;
  memberId: number;
  expiresAt: DateString;
}

export interface ResearchLineTable {
  id: Generated<number>;
  groupId: number;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface ResearchLineTranslationTable {
  researchLineId: number;
  locale: LocaleCode;
  name: string;
  description: string | null;
}
export interface MethodTable {
  id: Generated<number>;
  groupId: number;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface MethodTranslationTable {
  methodId: number;
  locale: LocaleCode;
  name: string;
  description: string | null;
}
export interface EquipmentTable {
  id: Generated<number>;
  groupId: number;
  name: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface SoftwareTable {
  id: Generated<number>;
  groupId: number;
  moreInfo: string | null;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface SoftwareTranslationTable {
  softwareId: number;
  locale: LocaleCode;
  name: string;
  description: string | null;
}
export interface AboutTable {
  id: Generated<number>;
  groupId: number;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface AboutTranslationTable {
  aboutId: number;
  locale: LocaleCode;
  description: string;
  objectivesContent: string;
  servicesContent: string;
  homeServicesTeaserContent: string;
}

export interface NewsTable {
  id: Generated<number>;
  statusCode: NewsStatusCode;
  publishedAt: DateString;
  priority: number | null;
  authorId: number;
  newsKindCode: NewsKindCode;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface NewsTranslationTable {
  newsId: number;
  locale: LocaleCode;
  title: string;
  summary: string;
  body: string;
}

export interface PublicationTable {
  id: Generated<number>;
  kindCode: PublicationKindCode;
  doi: string | null;
  publishedAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface PublicationTranslationTable {
  publicationId: number;
  locale: LocaleCode;
  title: string;
  abstract: string | null;
}
export interface JournalArticleTable {
  publicationId: number;
  journalId: number | null;
  issue: number | null;
}
export interface ConferencePaperTable {
  publicationId: number;
  eventId: number;
}
export interface ThesisTable {
  publicationId: number;
  universityId: number;
  thesisKindCode: ThesisKindCode;
}
export interface PublicationAuthorTable {
  publicationId: number;
  authorOrder: number;
  memberId: number | null;
  externalName: string | null;
}

export interface ProjectTable {
  id: Generated<number>;
  code: string;
  fundedAmountMinor: number;
  statusCode: ProjectStatusCode;
  startDate: DateString;
  endDate: DateString | null;
  researchLineId: number;
  currencyCode: CurrencyCode;
  fundingSourceCode: FundingSourceCode;
  createdAt: DateString;
  updatedAt: DateString;
}
export interface ProjectTranslationTable {
  projectId: number;
  locale: LocaleCode;
  title: string;
  description: string;
}
export interface ProjectMemberTable {
  projectId: number;
  memberId: number;
  createdAt: DateString;
  updatedAt: DateString;
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
  visibility: AssetVisibility;
  lifecycleStatus: AssetLifecycleStatus;
  createdBy: number | null;
  createdAt: DateString;
  deletedAt: DateString | null;
}
export interface AssetAuditTable {
  id: Generated<number>;
  assetId: number | null;
  action: string;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}

export interface MemberAssetTable {
  memberId: number;
  slot: "photo";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface NewsAssetTable {
  newsId: number;
  slot: "photo";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface MethodAssetTable {
  methodId: number;
  slot: "photo";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface ResearchLineAssetTable {
  researchLineId: number;
  slot: "photo";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface PublicationAssetTable {
  publicationId: number;
  slot: "file";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface ResearchGroupAssetTable {
  groupId: number;
  slot: "facilities" | "header" | "footer";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}
export interface AboutAssetTable {
  aboutId: number;
  slot: "photo";
  version: number;
  assetId: number;
  actorId: number | null;
  reason: string | null;
  createdAt: DateString;
}

// Kysely marks a column optional on insert only when its insert type includes null or undefined,
// and detects that with NonNullable, which does nothing while strictNullChecks is off.
// Adding `void` (assignable from undefined) makes every column optional on insert while strictNullChecks is off.
type OptionalOnInsert<Tables> = {
  [T in keyof Tables]: {
    [C in keyof Tables[T]]: ColumnType<
      SelectType<Tables[T][C]>,
      InsertType<Tables[T][C]> | void,
      UpdateType<Tables[T][C]>
    >;
  };
};

export type Database = OptionalOnInsert<DatabaseTables>;

interface DatabaseTables {
  locale: LocaleTable;
  gender: GenderTable;
  prefix: PrefixTable;
  role: RoleTable;
  member_type: MemberTypeTable;
  member_type_translation: MemberTypeTranslationTable;
  publication_kind: PublicationKindTable;
  publication_kind_translation: PublicationKindTranslationTable;
  thesis_kind: ThesisKindTable;
  thesis_kind_translation: ThesisKindTranslationTable;
  news_kind: NewsKindTable;
  news_kind_translation: NewsKindTranslationTable;
  currency: CurrencyTable;
  funding_source: FundingSourceTable;
  journal: JournalTable;
  university: UniversityTable;
  university_translation: UniversityTranslationTable;
  event: EventTable;
  event_translation: EventTranslationTable;
  research_group: ResearchGroupTable;
  research_group_translation: ResearchGroupTranslationTable;
  member: MemberTable;
  member_translation: MemberTranslationTable;
  session: SessionTable;
  password_reset: PasswordResetTable;
  research_line: ResearchLineTable;
  research_line_translation: ResearchLineTranslationTable;
  method: MethodTable;
  method_translation: MethodTranslationTable;
  equipment: EquipmentTable;
  software: SoftwareTable;
  software_translation: SoftwareTranslationTable;
  about: AboutTable;
  about_translation: AboutTranslationTable;
  news: NewsTable;
  news_translation: NewsTranslationTable;
  publication: PublicationTable;
  publication_translation: PublicationTranslationTable;
  journal_article: JournalArticleTable;
  conference_paper: ConferencePaperTable;
  thesis: ThesisTable;
  publication_author: PublicationAuthorTable;
  project: ProjectTable;
  project_translation: ProjectTranslationTable;
  project_member: ProjectMemberTable;
  member_group: MemberGroupTable;
  asset: AssetTable;
  asset_audit: AssetAuditTable;
  member_asset: MemberAssetTable;
  news_asset: NewsAssetTable;
  method_asset: MethodAssetTable;
  research_line_asset: ResearchLineAssetTable;
  publication_asset: PublicationAssetTable;
  research_group_asset: ResearchGroupAssetTable;
  about_asset: AboutAssetTable;
}

export type NewsRow = Selectable<NewsTable>;
export type ResearchLineRow = Selectable<ResearchLineTable>;
export type MethodRow = Selectable<MethodTable>;
