import type { AssetLinks } from "./asset";
import type { AuthorEntry } from "./author";

export interface SearchResults {
  publications: {
    id: number;
    title: string;
    asset: AssetLinks | null;
    abstract: string | null;
    doi: string | null;
    publishedAt: string;
    kindCode: "journal_article" | "conference_paper" | "thesis";
    subtype:
      | { kindCode: "journal_article"; journalArticle: { journalId?: number | null; issue?: number | null } }
      | { kindCode: "conference_paper"; conferencePaper: { eventId: number | null } }
      | { kindCode: "thesis"; thesis: { universityId: number | null; thesisKindCode: "phd" | "masters" | null } };
    authors: AuthorEntry[];
  }[];
  members: {
    id: number;
    dni: string;
    email: string;
    firstName: string;
    lastName: string;
    maternalName: string | null;
    birthDate: string | null;
    bio: string | null;
    photoUrl: string;
    photoAlt: string;
    isActive: number;
    roleCode: "administrator" | "researcher" | "visitor";
    memberTypeCode: "researcher" | "phd_student" | "master_student" | "undergraduate_student" | "collaborator";
    prefixCode: "dr" | "dra" | "mg" | "lic" | "bach" | "ing" | "none" | null;
  }[];
  news: {
    id: number;
    title: string;
    publishedAt: string;
    asset: string | null;
    newsKindCode: "general" | "research" | "event";
    statusCode: "draft" | "published" | "archived";
    authorName: string;
  }[];
  projects: {
    id: number;
    title: string;
    code: string;
    fundedAmountMinor: number;
    description: string;
    statusCode: "planned" | "active" | "completed" | "archived";
    startDate: string;
    endDate: string | null;
    researchLineId: number;
    fundingSourceCode: "vrip" | "none";
    currencyCode: "pen" | "usd";
    researchLine: string;
    fundingSource: string;
    members: { memberId: number; name: string; photoUrl: string; photoAlt: string }[];
  }[];
}
