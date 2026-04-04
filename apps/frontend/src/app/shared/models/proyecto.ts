import { Autor } from "./autores";
import { Usuario } from "./usuario";

export interface Proyecto {
  idProyecto?: number;
  titulo?: string;
  tituloEN?: string;
  codigo?: string;
  fuenteFinanciamiento?: string;
  montoFinanciado?: string;
  descripcion?: string;
  descripcionEN?: string;
  estado?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  fechaI?: string;
  fechaF?: string;
  lineasInvestigacion_idLineasInvestigacion?: number;
  lineasInvestigacion?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  fuenteFinanciamiento_idFuenteFinanciamiento?: number;
  moneda_idMoneda?: number;
  moneda?: string;
  usuario?: Usuario[];
  autor?: Autor[];
}
