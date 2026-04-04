export interface Noticia {
  idNoticia?: number;
  titulo?: string;
  resumen?: string;
  cuerpo?: string;
  fechaPublicacion?: string;
  estado?: number;
  status?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  foto?: string;
  autorPublicacion?: string;
  tipoNoticia_idtipoNoticia?: number;
  nombreTipoNoticia?: string;
  autor?: string;
}
