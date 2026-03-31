import { Proyecto } from "./proyecto";

export class lineasInvestigacion {
  constructor(
    public idLineasInvestigacion: Number,
    public nombre: String,
    public nombreEN: String,
    public foto: String,
    public descripcion: String,
    public descripcionEN: String,
    public grupo_idGrupo: Number,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public proyectos: Array<Proyecto>,
    public page: Number,
  ) {}
}
