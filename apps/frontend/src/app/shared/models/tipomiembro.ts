import { UsuarioFull } from "./usuarioFull";

export class TipoMiembro {
  constructor(
    public idTipoMiembro: Number,
    public nombre: String,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public miembros: Array<UsuarioFull>,
  ) {}
}
