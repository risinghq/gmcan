export class Equipo{
    constructor(
        public idEquipo: Number,
        public nombre: String,
        public cpu: String,
        public gpu: String,
        public ram: String,
        public hd: String,
        public grupo_idGrupo: String,
        public fechaCreacion: Date,
        public fechaActualizacion: Date,
    ){}
}
