export class Software{
    constructor(
        public idSoftware: Number,
        public nombre: String,
        public descripcion: String,
        public moreInfo: String,
        public grupo_idGrupo: String,
        public fechaCreacion: Date,
        public fechaActualizacion: Date
    ){}
}
