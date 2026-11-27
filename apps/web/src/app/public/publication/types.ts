import type { PublicationDisplay as SharedPublicationDisplay } from "@app/shared/publication-display";
import type { PublicationKindCode, PublicPublicationWithAuthors } from "@gmcan/contracts/public";

export const PUBLICATION_TABS = [
  "journal_article",
  "thesis",
  "conference_paper",
] as const satisfies PublicationKindCode[];

export type PublicationDisplay = SharedPublicationDisplay<PublicPublicationWithAuthors>;

export type PublicationViewModel = {
  articulos: PublicationDisplay[];
  tesis: PublicationDisplay[];
  resumenes: PublicationDisplay[];
  infoText: string;
};
