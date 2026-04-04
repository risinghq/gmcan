import { UsuarioFull } from "./usuarioFull";

export interface TipoMiembro {
  idTipoMiembro?: number;
  nombre?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  miembros?: UsuarioFull[];
}
