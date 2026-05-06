import type { AssetLinks } from "./asset";
import type { AuthorEntry } from "./author";

export interface Publication {
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
  updatedAt: string | null;
  createdAt: string | null;
}

export interface PublicationWithAuthors extends Publication {
  authors: AuthorEntry[];
}
