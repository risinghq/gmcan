import { Usuario } from './usuario';
import { Autor } from './autores';

export class Proyecto{
    constructor(
        public idProyecto: Number,
        public titulo: String,
        public tituloIngles: String,
        public codigo: String,
        public fuenteFinanciamiento: String,
        public montoFinanciado: String,
        public descripcion : String,
        public descripcionIngles: String,
        public estado: Number,
        public fechaInicio: Date,
        public fechaFin: Date,
        public fechaI: string,
        public fechaF: string,
        public lineasInvestigacion_idLineasInvestigacion: Number,
        public lineasInvestigacion: String,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public usuario: Array<Usuario>,
        public autor: Array<Autor>
    ){}
}
