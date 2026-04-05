export interface LookupData {
  generos: { idGenero: number; nombre: string }[];
  prefijos: { idPrefijo: number; nombre: string }[];
  tiposMiembro: {
    idTipoMiembro: number;
    nombre: string;
    nombreEN: string;
    nombreSingular: string;
    nombreSingularEN: string;
  }[];
  tiposPublicacion: { idTipoPublicacion: number; nombre: string; nombreEN: string }[];
  tiposTesis: { idTipoTesis: number; nombre: string; nombreEN: string }[];
  monedas: { idMoneda: number; simbolo: string }[];
  tiposNoticia: { idtipoNoticia: number; nombre: string; nombreEN: string }[];
  tiposUsuario: { idTipoUsuario: number; nombre: string }[];
  fuentesFinanciamiento: { idFuenteFinanciamiento: number; nombre: string }[];
  universidades: { idUniversidad: number; nombre: string | null; nombreEN: string | null }[];
  revistas: { idRevista: number; nombre: string }[];
  eventos: { idEvento: number; nombre: string; ciudad: string | null; pais: string | null }[];
}
