import { Autor } from './autores';
import { Usuario } from './usuario';

export class Publicacion{
    constructor(
        public idPublicacion: Number,
        public titulo: String,
        public archivo: String,
        public autores: String,
        public DOI: number,
        public fecha: String,
        public fechaPublicacion: Date,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public tipoPublicacion_idTipoPublicacion: Number,
        public revista: String,
        public nroRevista: Number,
        public revista_idRevista: Number,
        public autor: Array<Autor>,
        public usuario: Array<Usuario>,
    ){}
}
