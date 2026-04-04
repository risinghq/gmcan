import type { PublicationAuthor } from "./author";

export interface Publicacion {
  idPublicacion?: number;
  titulo?: string;
  archivo?: string;
  resumen?: string;
  resumenEN?: string;
  DOI?: string;
  fecha?: string;
  fechaPublicacionDate?: Date;
  fechaPublicacion?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  tipoPublicacion_idTipoPublicacion?: number;
  tipoPublicacion?: string;
  revista?: string;
  nroRevista?: number;
  revista_idRevista?: number;
  universidad_idUniversidad?: number;
  universidad?: string;
  autor?: PublicationAuthor[];
  ciudad_idCiudad?: number;
  ciudad?: string;
  pais?: string;
  evento_idEvento?: number;
  evento?: string;
  tipoTesis_idTipoTesis?: number;
  tipoTesis?: string;
}
