import type { Generated } from "kysely";

// All dates stored as ISO strings (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
type DateString = string;

export interface EquipoTable {
  idEquipo: Generated<number>;
  nombre: string;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  hd: string | null;
  grupo_idGrupo: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface EventoTable {
  idEvento: Generated<number>;
  nombre: string;
  ciudad: string | null;
  pais: string | null;
  ciudadEN: string | null;
  paisEN: string | null;
}

export interface FuenteFinanciamientoTable {
  idFuenteFinanciamiento: Generated<number>;
  nombre: string;
}

export interface GeneroTable {
  idGenero: Generated<number>;
  nombre: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface GrupoTable {
  idGrupo: Generated<number>;
  quienesSomosResumenEN: string;
  quienesSomosResumen: string;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
  nombreGrupo: string | null;
  nombreGrupo2: string | null;
  facilidadesRecursosFoto: string | null;
  facilidadesRecursos: string | null;
  facilidadesRecursosEN: string | null;
  trabajosFuturos: string | null;
  trabajosFuturosEN: string | null;
  logoFooter: string | null;
  logoHeader: string | null;
  seccionPublicaciones: string | null;
  seccionPublicacionesEN: string | null;
  seccionProyectos: string | null;
  seccionProyectosEN: string | null;
  fechaCreacion: DateString;
  fechaActualizacion: DateString;
}

export interface LineasInvestigacionTable {
  idLineasInvestigacion: Generated<number>;
  nombre: string;
  nombreEN: string;
  descripcion: string | null;
  descripcionEN: string | null;
  foto: string | null;
  grupo_idGrupo: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface MetodoTable {
  idMetodo: Generated<number>;
  nombreEN: string;
  nombre: string;
  descripcion: string;
  descripcionEN: string | null;
  foto: string | null;
  grupo_idGrupo: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface MonedaTable {
  idMoneda: Generated<number>;
  simbolo: string;
}

export interface NoticiaTable {
  idNoticia: Generated<number>;
  titulo: string | null;
  tituloEN: string | null;
  resumen: string | null;
  resumenEN: string | null;
  cuerpo: string | null;
  cuerpoEN: string | null;
  estado: number | null;
  fechaPublicacion: DateString | null;
  fechaActualizacion: DateString | null;
  fechaCreacion: DateString | null;
  foto: string | null;
  prioridad: number | null;
  autorPublicacion: string | null;
  tipoNoticia_idtipoNoticia: number | null;
}

export interface PermisoTable {
  idPermiso: Generated<number>;
  nombre: string;
  fechaCreacion: DateString;
  fechaActualizacion: DateString;
}

export interface PrefijoTable {
  idPrefijo: Generated<number>;
  nombre: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface ProyectoTable {
  idProyecto: Generated<number>;
  titulo: string;
  tituloEN: string | null;
  codigo: string;
  montoFinanciado: string;
  descripcion: string;
  descripcionEN: string | null;
  estado: number | null;
  fechaInicio: DateString;
  fechaFin: DateString | null;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
  lineasInvestigacion_idLineasInvestigacion: number;
  moneda_idMoneda: number;
  fuenteFinanciamiento_idFuenteFinanciamiento: number;
}

export interface PublicacionTable {
  idPublicacion: Generated<number>;
  titulo: string;
  archivo: string | null;
  resumen: string | null;
  resumenEN: string | null;
  nroRevista: number | null;
  DOI: string | null;
  fechaPublicacion: DateString;
  fechaActualizacion: DateString | null;
  fechaCreacion: DateString | null;
  tipoPublicacion_idTipoPublicacion: number;
  revista_idRevista: number | null;
  universidad_idUniversidad: number | null;
  evento_idEvento: number | null;
  tipoTesis_idTipoTesis: number | null;
}

export interface PublicacionHasAutorTable {
  idPublicacionHasAutor: Generated<number>;
  publicacion_idPublicacion: number;
  isPrincipal: number;
  nombre: string | null; // external authors only
  usuario_DNI: string | null; // registered users only
}

export interface RevistaTable {
  idRevista: Generated<number>;
  nombre: string;
}

export interface SobreNosotrosTable {
  idSobreNosotros: Generated<number>;
  quienesSomos: string;
  quienesSomosEN: string;
  objetivos: string | null;
  objetivosEN: string | null;
  servicios: string | null;
  serviciosEN: string | null;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
  foto: string | null;
  grupo_idGrupo: number;
}

export interface SoftwareTable {
  idSoftware: Generated<number>;
  nombre: string | null;
  descripcion: string | null;
  descripcionEN: string | null;
  moreInfo: string | null;
  grupo_idGrupo: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface TipoMiembroTable {
  idTipoMiembro: Generated<number>;
  nombre: string;
  nombreEN: string;
  nombreSingular: string;
  nombreSingularEN: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface TipoNoticiaTable {
  idtipoNoticia: Generated<number>;
  nombre: string;
  nombreEN: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface TipoPermisoTable {
  idTipoPermiso: Generated<number>;
  nombre: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface TipoPublicacionTable {
  idTipoPublicacion: Generated<number>;
  nombre: string;
  nombreEN: string;
  fechaActualizacion: DateString;
  fechaCreacion: DateString;
}

export interface TipoTesisTable {
  idTipoTesis: Generated<number>;
  nombre: string;
  nombreEN: string;
  fechaCreacion: DateString;
  fechaActualizacion: DateString;
}

export interface TipoUsuarioTable {
  idTipoUsuario: Generated<number>;
  nombre: string;
  fechaCreacion: DateString;
  fechaActualizacion: DateString;
}

export interface UniversidadTable {
  idUniversidad: Generated<number>;
  nombreEN: string | null;
  nombre: string | null;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface UsuarioTable {
  DNI: string;
  correo: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  fechaNacimiento: DateString | null;
  resumenPro: string | null;
  resumenProEN: string | null;
  foto: string | null;
  estado: number;
  restablecer: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
  tipoUsuario_idTipoUsuario: number;
  tipoMiembro_idTipoMiembro: number;
  prefijo_idPrefijo: number | null;
  genero_idGenero: number | null;
  reset_token: string | null;
  reset_expires: DateString | null;
}

export interface UsuarioHasGrupoTable {
  usuario_DNI: string;
  grupo_idGrupo: number;
  fechaCreacion: DateString;
  fechaActualizacion: DateString;
}

export interface UsuarioHasProyectoTable {
  proyecto_idProyecto: number;
  usuario_DNI: string;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface UsuarioHasPermisoTable {
  usuario_DNI: string;
  permiso_idPermiso: number;
  fechaCreacion: DateString | null;
  fechaActualizacion: DateString | null;
}

export interface SessionTable {
  id: string;
  userDNI: string;
  userCorreo: string;
  expiresAt: DateString;
  lastActive: DateString;
}

export interface Database {
  equipo: EquipoTable;
  evento: EventoTable;
  fuentefinanciamiento: FuenteFinanciamientoTable;
  genero: GeneroTable;
  grupo: GrupoTable;
  lineasinvestigacion: LineasInvestigacionTable;
  metodo: MetodoTable;
  moneda: MonedaTable;
  noticia: NoticiaTable;
  permiso: PermisoTable;
  prefijo: PrefijoTable;
  proyecto: ProyectoTable;
  publicacion: PublicacionTable;
  publicacion_has_autor: PublicacionHasAutorTable;
  revista: RevistaTable;
  sobrenosotros: SobreNosotrosTable;
  software: SoftwareTable;
  tipomiembro: TipoMiembroTable;
  tiponoticia: TipoNoticiaTable;
  tipopermiso: TipoPermisoTable;
  tipopublicacion: TipoPublicacionTable;
  tipotesis: TipoTesisTable;
  tipousuario: TipoUsuarioTable;
  universidad: UniversidadTable;
  usuario: UsuarioTable;
  usuario_has_grupo: UsuarioHasGrupoTable;
  usuario_has_proyecto: UsuarioHasProyectoTable;
  usuariohaspermiso: UsuarioHasPermisoTable;
  session: SessionTable;
}
