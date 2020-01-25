export class PublicacionHasAutor{
    constructor(
        public publicacion_idPublicacion: Number,
        public usuario_idUsuario: Number,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
        public isPrincipal: Number,
    ){}
}