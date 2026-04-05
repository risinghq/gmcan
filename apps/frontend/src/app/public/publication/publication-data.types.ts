import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";

export type PublicationViewModel = {
  publicaciones: Publicacion[];
  tipoPublicaciones: TipoPublicacion[];
  infoText: string;
};
