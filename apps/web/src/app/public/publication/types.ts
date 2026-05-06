import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

export type PublicationDisplay = PublicPublicationWithAuthors & {
  fecha: string;
  tipoPublicacion?: string;
  tipoTesis?: string;
  revista?: string;
  universidad?: string;
  evento?: string;
  ciudad?: string | null;
  pais?: string | null;
};

export type PublicationViewModel = {
  articulos: PublicationDisplay[];
  tesis: PublicationDisplay[];
  resumenes: PublicationDisplay[];
  infoText: string;
};
