import type { PublicationAuthor } from "./author";

export interface SearchResults {
  publications: {
    idPublicacion: number;
    titulo: string;
    archivo: string | null;
    resumen: string | null;
    resumenEN: string | null;
    nroRevista: number | null;
    DOI: string | null;
    fechaPublicacion: string;
    tipoPublicacion_idTipoPublicacion: number;
    revista_idRevista: number | null;
    universidad_idUniversidad: number | null;
    evento_idEvento: number | null;
    tipoTesis_idTipoTesis: number | null;
    autor: PublicationAuthor[];
  }[];
  members: {
    DNI: string;
    correo: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
    fechaNacimiento: string | null;
    resumenPro: string | null;
    resumenProEN: string | null;
    foto: string | null;
    estado: number;
    tipoUsuario_idTipoUsuario: number;
    tipoMiembro_idTipoMiembro: number;
    prefijo_idPrefijo: number | null;
  }[];
  news: {
    idNoticia: number;
    titulo: string | null;
    fechaPublicacion: string | null;
    foto: string | null;
    autorPublicacion: string | null;
    tipoNoticia_idtipoNoticia: number | null;
    estado: number | null;
    autor: string;
  }[];
  projects: {
    idProyecto: number;
    titulo: string;
    tituloEN: string | null;
    codigo: string;
    montoFinanciado: string;
    descripcion: string;
    descripcionEN: string | null;
    estado: number | null;
    fechaInicio: string;
    fechaFin: string | null;
    lineasInvestigacion_idLineasInvestigacion: number;
    fuenteFinanciamiento_idFuenteFinanciamiento: number;
    moneda_idMoneda: number;
    lineasInvestigacion: string;
    fuenteFinanciamiento: string;
    usuario: {
      DNI: string;
      nombreCompleto: string;
      foto: string | null;
    }[];
  }[];
}
