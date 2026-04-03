import { Autor } from "./autores";
import { Usuario } from "./usuario";

export class Proyecto {
  constructor(
    public idProyecto: Number,
    public titulo: String,
    public tituloEN: String,
    public codigo: String,
    public fuenteFinanciamiento: String,
    public montoFinanciado: String,
    public descripcion: String,
    public descripcionEN: String,
    public estado: Number,
    public fechaInicio: Date,
    public fechaFin: Date,
    public fechaI: string,
    public fechaF: string,
    public lineasInvestigacion_idLineasInvestigacion: Number,
    public lineasInvestigacion: String,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public fuenteFinanciamiento_idFuenteFinanciamiento: Number,
    public moneda_idMoneda: Number,
    public moneda: string,
    public usuario: Array<Usuario>,
    public autor: Array<Autor>,
  ) {}
}
