import { Usuario } from './usuario';

export class Noticia{
    constructor(
        public idNoticia: Number,
        public titulo: String,
        public resumen: String,
        public cuerpo: String,
        public fechaPublicacion: string,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public foto: String,
        public autorPublicacion: String,
        public tipoNoticia_idtipoNoticia: Number,
        public nombreTipoNoticia: String,
        public autor: String
    ){}
}
