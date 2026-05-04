import type { Group } from "@app/shared/models/group";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
import type { News } from "@app/shared/models/news";
import type { Project } from "@app/shared/models/project";
import type { PublicationWithAuthors } from "@app/shared/models/publication";
import type { ResearchLine } from "@app/shared/models/research-line";

export type HomePublicacion = PublicationWithAuthors & {
  fecha: string;
  tipoPublicacion?: string;
  tipoTesis?: string;
  revista?: string;
  universidad?: string;
  evento?: string;
  ciudad?: string | null;
  pais?: string | null;
};

export type HomeProjectMember = {
  memberId: number;
  name: string;
  asset: string | null;
};

export type HomeProyecto = Project & {
  fechaI: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
  members: HomeProjectMember[];
};

export type HomeNoticia = News & {
  nombreTipoNoticia: string;
  autor: string;
  fechaPublicacion: string;
};

export type HomeViewModel = {
  info: Group;
  publicaciones: HomePublicacion[];
  proyectos: HomeProyecto[];
  noticias: HomeNoticia[];
  noticiaPrincipal: HomeNoticia | null;
  lineasInvestigacion: ResearchLine[];
  metodos: Method[];
  miembros: Member[];
  aboutUs: string;
  articulos: number;
  tesis: number;
  resumenes: number;
};
