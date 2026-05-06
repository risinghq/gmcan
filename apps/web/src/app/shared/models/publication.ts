import type { AssetLinks } from "./asset";
import type { AuthorEntry } from "./author";

export interface Publication {
  id: number;
  title: string;
  asset: AssetLinks | null;
  abstract: string | null;
  journalIssue: number | null;
  doi: string | null;
  publishedAt: string;
  typeId: number;
  journalId: number | null;
  universityId: number | null;
  eventId: number | null;
  thesisTypeId: number | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface PublicationWithAuthors extends Publication {
  authors: AuthorEntry[];
}
