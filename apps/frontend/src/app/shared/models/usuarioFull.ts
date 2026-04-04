export interface UsuarioFull {
  DNI?: string;
  correo?: string;
  nombre?: string;
  password?: string;
  segundoNombre?: string;
  nombreCompleto?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  foto?: string;
  estado?: number;
  active?: string;
  resumenPro?: string;
  resumenProEN?: string;
  fechaActualizacion?: Date;
  fechaCreacion?: Date;
  fechaNacimiento?: string | null;
  fechaNacimientoDate?: Date;
  tipoMiembro_idTipoMiembro?: number;
  genero_idGenero?: number;
  tipoMiembro?: string;
  tipoUsuario_idTipoUsuario?: number;
  prefijo?: string;
  prefijo_idPrefijo?: number;
}
