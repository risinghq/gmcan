import { Autor } from "./autores";
import { Usuario } from "./usuario";

export interface Publicacion {
  idPublicacion?: number;
  titulo?: string;
  archivo?: string;
  autores?: string;
  resumen?: string;
  resumenEN?: string;
  DOI?: number;
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
  autor?: Autor[];
  usuario?: Usuario[];
  ciudad_idCiudad?: number;
  ciudad?: string;
  pais?: string;
  evento_idEvento?: number;
  evento?: string;
  tipoTesis_idTipoTesis?: number;
  tipoTesis?: string;
}
