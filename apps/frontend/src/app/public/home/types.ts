import type { Grupo } from "@app/shared/models/grupo";
import type { Method } from "@app/shared/models/method";
import type { Noticia } from "@app/shared/models/noticia";
import type { Proyecto } from "@app/shared/models/proyecto";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { Usuario } from "@app/shared/models/usuario";

export type HomePublicacion = Publicacion & {
  fecha: string;
};

export type HomeProyecto = Proyecto & {
  fechaI: string;
  usuario: Usuario[];
};

export type HomeNoticia = Noticia & {
  nombreTipoNoticia: string;
  autor: string;
};

export type HomeViewModel = {
  info: Grupo;
  publicaciones: HomePublicacion[];
  proyectos: HomeProyecto[];
  noticias: HomeNoticia[];
  noticiaPrincipal: HomeNoticia | null;
  lineasInvestigacion: Array<{ idLineasInvestigacion?: number; nombre?: string; descripcion?: string; foto?: string }>;
  metodos: Method[];
  usuarios: Usuario[];
  aboutUs: string;
  articulos: number;
  tesis: number;
  resumenes: number;
};
