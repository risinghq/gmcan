import type { AuthorEntry } from "./author";

export interface SearchResults {
  publications: {
    id: number;
    title: string;
    file: string | null;
    fileUrl?: string | null;
    abstract: string | null;
    journalIssue: number | null;
    doi: string | null;
    publishedAt: string;
    typeId: number;
    journalId: number | null;
    universityId: number | null;
    eventId: number | null;
    thesisTypeId: number | null;
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
    photo: string | null;
    photoUrl?: string | null;
    status: number;
    roleId: number;
    memberTypeId: number;
    prefixId: number | null;
  }[];
  news: {
    id: number;
    title: string;
    publishedAt: string;
    photo: string | null;
    photoUrl?: string | null;
    newsTypeId: number;
    status: number;
    authorName: string;
  }[];
  projects: {
    id: number;
    title: string;
    code: string;
    fundedAmount: string;
    description: string;
    status: number | null;
    startDate: string;
    endDate: string | null;
    researchLineId: number;
    fundingSourceId: number;
    currencyId: number;
    researchLine: string;
    fundingSource: string;
    members: { memberId: number; name: string; photo: string | null; photoUrl?: string | null }[];
  }[];
}
