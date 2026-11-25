import fs from "node:fs";
import path from "node:path";

import type {
  CurrencyCode,
  FundingSourceCode,
  LocaleCode,
  MemberTypeCode,
  NewsKindCode,
  NewsStatusCode,
  PrefixCode,
  ProjectStatusCode,
  RoleCode,
  ThesisKindCode,
} from "../schema.js";

const DATA_ROOT = path.resolve(process.cwd(), "db/seed/data");

type Localized<T> = Record<LocaleCode, T>;

export interface SeedGroup {
  id: number;
  slug: string;
  shortName: string;
  fullName: string;
  address: string;
  email: string;
  phone: string;
  translations: Localized<{
    summary: string;
    facilities: string | null;
    futureWork: string | null;
    publicationsSection: string | null;
    projectsSection: string | null;
  }>;
  assets: Record<"facilities" | "header" | "footer", string>;
}

export interface SeedTopic {
  id: number;
  translations: Localized<{ name: string; description: string | null }>;
  photo: string | null;
}

export interface SeedSoftware {
  id: number;
  moreInfo: string | null;
  translations: Localized<{ name: string; description: string | null }>;
}

export interface SeedEquipment {
  id: number;
  name: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
}

export interface SeedAbout {
  id: number;
  translations: Localized<{
    description: string;
    objectives: { introParagraphs: string[]; items: string[] };
    services: { introParagraphs: string[]; items: string[] };
  }>;
  photo: string | null;
}

export interface SeedMember {
  email: string;
  firstName: string;
  lastName: string;
  maternalName: string | null;
  isActive: boolean;
  roleCode: RoleCode;
  memberTypeCode: MemberTypeCode;
  prefixCode: PrefixCode | null;
  bio: Localized<string>;
  photo: string | null;
}

export interface SeedNews {
  id: number;
  statusCode: NewsStatusCode;
  publishedAt: string;
  authorEmail: string;
  newsKindCode: NewsKindCode;
  translations: Localized<{ title: string; summary: string; body: string }>;
  photo: string | null;
}

export interface SeedJournal {
  id: number;
  name: string;
}

export interface SeedUniversity {
  id: number;
  name: Localized<string>;
}

export interface SeedEvent {
  id: number;
  translations: Localized<{ name: string; city: string; country: string }>;
}

export interface SeedProject {
  id: number;
  code: string;
  fundedAmountMinor: number;
  statusCode: ProjectStatusCode;
  startDate: string;
  endDate: string | null;
  researchLineId: number;
  currencyCode: CurrencyCode;
  fundingSourceCode: FundingSourceCode;
  memberEmails: string[];
  translations: Localized<{ title: string; description: string }>;
}

export type SeedAuthor = { email: string } | { name: string };

interface SeedPublicationBase {
  id: number;
  doi: string | null;
  publishedAt: string;
  translations: Localized<{ title: string; abstract: string | null }>;
  authors: SeedAuthor[];
  file: string | null;
}

export type SeedPublication = SeedPublicationBase &
  (
    | { kindCode: "journal_article"; journalId: number | null; issue: number | null }
    | { kindCode: "conference_paper"; eventId: number }
    | { kindCode: "thesis"; universityId: number; thesisKindCode: ThesisKindCode }
  );

function read<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_ROOT, `${name}.json`), "utf8")) as T;
}

export const seedData = {
  group: read<SeedGroup>("group"),
  researchLines: read<SeedTopic[]>("research-lines"),
  methods: read<SeedTopic[]>("methods"),
  software: read<SeedSoftware[]>("software"),
  equipment: read<SeedEquipment[]>("equipment"),
  about: read<SeedAbout>("about"),
  members: read<SeedMember[]>("members"),
  news: read<SeedNews[]>("news"),
  journals: read<SeedJournal[]>("journals"),
  universities: read<SeedUniversity[]>("universities"),
  events: read<SeedEvent[]>("events"),
  projects: read<SeedProject[]>("projects"),
  publications: read<SeedPublication[]>("publications"),
};
