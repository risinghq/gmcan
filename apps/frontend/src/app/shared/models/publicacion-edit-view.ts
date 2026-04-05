import type { PublicationAuthor } from "./author";
import type { Publicacion } from "./publicacion";

export interface PublicacionEditView {
  publicacion: Publicacion;
  autores: PublicationAuthor[];
}
