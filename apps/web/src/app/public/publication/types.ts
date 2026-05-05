import type { PublicationWithAuthors } from "@app/shared/models/publication";

export type PublicationDisplay = PublicationWithAuthors & {
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
