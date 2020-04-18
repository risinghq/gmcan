export class TipoPublicacion{
    constructor(
        public idTipoPublicacion: Number,
        public nombre: String,
        public nombreTab: String,
        public fechaActualizacion: Date,
        public fechaCreacion: Date,
        public search:String
    ){}
}
