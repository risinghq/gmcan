export class UsuarioFull{
    constructor(
        public DNI: String,
        public correo: String,
        public nombre: String,
        public nombreCompleto: String,
        public apellidoPaterno: String,
        public apellidoMaterno: String,
        public foto: String,
        public estado: Number,
        public active: String,
        public resumenPro: String,
        public fechaActualizacion: Date,
        public fechaCreacion: Date,
        public fechaNacimiento: Date,
        public tipoMiembro_idTipoMiembro: Number,
        public tipoMiembro: String,
        public tipoUsuario_idTipoUsuario: Number,
        public prefijo: String,
        public Prefijo_idPrefijo: Number,
    ){}
}