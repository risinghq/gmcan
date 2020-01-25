import { Autor } from './autores';

export class Publicacion{
    constructor(
        public idPublicacion: Number,
        public titulo: String,
        public archivo: String,
        public fechaPublicacion: Date,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public tipoPublicacion_idTipoPublicacion: Number,
        public autores: String,
    ){}
}
