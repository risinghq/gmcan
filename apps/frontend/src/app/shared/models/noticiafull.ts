export interface NoticiaFull {
  idNoticia?: number;
  titulo?: string;
  tituloEN?: string;
  resumen?: string;
  resumenEN?: string;
  cuerpo?: string;
  cuerpoEN?: string;
  fechaPublicacionDate?: Date;
  fechaPublicacion?: string;
  estado?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  fotoFile?: any;
  foto?: string;
  autorPublicacion?: string;
  tipoNoticia_idtipoNoticia?: number;
}
