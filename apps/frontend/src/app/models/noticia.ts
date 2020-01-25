export class Noticia{
    constructor(
        public idNoticia: Number,
        public titulo: String,
        public resumen: String,
        public cuerpo: String,
        public fechaPublicacion: String,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public foto: String,
        public autorPublicacion: String
    ){}
}
