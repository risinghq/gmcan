import type { PublicationDisplay as SharedPublicationDisplay } from "@app/shared/publication-display";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

export type PublicationDisplay = SharedPublicationDisplay<PublicPublicationWithAuthors>;

export type PublicationViewModel = {
  articulos: PublicationDisplay[];
  tesis: PublicationDisplay[];
  resumenes: PublicationDisplay[];
  infoText: string;
};
