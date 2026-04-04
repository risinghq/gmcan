import { Proyecto } from "./proyecto";

export interface LineasInvestigacion {
  idLineasInvestigacion?: number;
  nombre?: string;
  nombreEN?: string;
  foto?: string;
  descripcion?: string;
  descripcionEN?: string;
  grupo_idGrupo?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  proyectos?: Proyecto[];
  page?: number;
}
