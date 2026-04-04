import { EmailBody } from "./emailBody";
import { Equipo } from "./equipo";
import { Grupo } from "./grupo";
import { LineasInvestigacion } from "./lineaInvestigacion";
import { Noticia } from "./noticia";
import { NoticiaFull } from "./noticiafull";
import { Proyecto } from "./proyecto";
import { Publicacion } from "./publicacion";
import { UsuarioFull } from "./usuarioFull";

export function createGrupo(): Grupo {
  return {
    idGrupo: 0,
    quienesSomosResumen: "",
    quienesSomosResumenEN: "",
    quienesSomos: "",
    quienesSomosEN: "",
    direccion: "",
    correo: "",
    nombreGrupo: "",
    nombreGrupo2: "",
    objetivos: "",
    lineasInvestigacion: "",
    telefono: "",
    servicios: "",
    facilidadesRecursosFoto: "",
    facilidadesRecursos: "",
    facilidadesRecursosEN: "",
    trabajosFuturos: "",
    trabajosFuturosEN: "",
    seccionPublicaciones: "",
    seccionPublicacionesEN: "",
    seccionProyectos: "",
    seccionProyectosEN: "",
    foto: "",
    logoFooter: "",
    logoHeader: "",
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
  };
}

export function createProyecto(): Proyecto {
  return {
    idProyecto: 0,
    titulo: "",
    tituloEN: "",
    codigo: "",
    fuenteFinanciamiento: "",
    montoFinanciado: "",
    descripcion: "",
    descripcionEN: "",
    estado: 0,
    fechaInicio: undefined,
    fechaFin: undefined,
    fechaI: "",
    fechaF: "",
    lineasInvestigacion_idLineasInvestigacion: 0,
    lineasInvestigacion: "",
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
    fuenteFinanciamiento_idFuenteFinanciamiento: 0,
    moneda_idMoneda: 0,
    moneda: "",
    usuario: [],
  };
}

export function createEquipo(): Equipo {
  return {
    idEquipo: 0,
    nombre: "",
    cpu: "",
    gpu: "",
    ram: "",
    hd: "",
    grupo_idGrupo: 1,
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
  };
}

export function createPublicacion(): Publicacion {
  return {
    idPublicacion: 0,
    titulo: "",
    archivo: "",

    resumen: "",
    resumenEN: "",
    DOI: "",
    fecha: "",
    fechaPublicacionDate: undefined,
    fechaPublicacion: "",
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
    tipoPublicacion_idTipoPublicacion: 0,
    tipoPublicacion: "",
    revista: "",
    nroRevista: 0,
    revista_idRevista: 0,
    universidad_idUniversidad: 0,
    universidad: "",
    autor: [],
    ciudad_idCiudad: 0,
    ciudad: "",
    pais: "",
    evento_idEvento: 0,
    evento: "",
    tipoTesis_idTipoTesis: 0,
    tipoTesis: "",
  };
}

export function createNoticia(): Noticia {
  return {
    idNoticia: 0,
    titulo: "",
    resumen: "",
    cuerpo: "",
    fechaPublicacion: "",
    estado: 0,
    status: "",
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
    foto: "",
    autorPublicacion: "",
    tipoNoticia_idtipoNoticia: 0,
    nombreTipoNoticia: "",
    autor: "",
  };
}

export function createNoticiaFull(): NoticiaFull {
  return {
    idNoticia: 0,
    titulo: "",
    tituloEN: "",
    resumen: "",
    resumenEN: "",
    cuerpo: "",
    cuerpoEN: "",
    fechaPublicacionDate: undefined,
    fechaPublicacion: "",
    estado: 0,
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
    fotoFile: undefined,
    foto: "",
    autorPublicacion: "",
    tipoNoticia_idtipoNoticia: 0,
  };
}

export function createUsuarioFull(): UsuarioFull {
  return {
    DNI: "",
    correo: "",
    nombre: "",
    password: "",
    segundoNombre: "",
    nombreCompleto: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    foto: "",
    estado: 0,
    active: "",
    resumenPro: "",
    resumenProEN: "",
    fechaActualizacion: undefined,
    fechaCreacion: undefined,
    fechaNacimiento: undefined,
    fechaNacimientoDate: undefined,
    tipoMiembro_idTipoMiembro: 0,
    genero_idGenero: 0,
    tipoMiembro: "",
    tipoUsuario_idTipoUsuario: 0,
    prefijo: "",
    prefijo_idPrefijo: 0,
  };
}

export function createLineasInvestigacion(): LineasInvestigacion {
  return {
    idLineasInvestigacion: 0,
    nombre: "",
    nombreEN: "",
    foto: "",
    descripcion: "",
    descripcionEN: "",
    grupo_idGrupo: 0,
    fechaCreacion: undefined,
    fechaActualizacion: undefined,
    proyectos: [],
    page: 0,
  };
}

export function createEmailBody(): EmailBody {
  return {
    nombre: "",
    razon: "",
    correo: "",
    telefono: "",
  };
}
