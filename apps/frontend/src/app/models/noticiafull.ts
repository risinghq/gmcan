export class NoticiaFull{
    constructor(
        public idNoticia: Number,
        public titulo: String,
        public tituloEN: String,
        public resumen: String,
        public resumenEN: String,
        public cuerpo: String,
        public cuerpoEN: String,
        public fechaPublicacionDate: Date,
        public fechaPublicacion,
        public estado: Number,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public fotoFile,
        public foto:string,
        public autorPublicacion: string,
        public tipoNoticia_idtipoNoticia: Number,
    ){}
}
