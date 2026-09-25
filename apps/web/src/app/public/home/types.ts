import type { Group } from "@app/shared/models/group";
import type { Member } from "@app/shared/models/member";
import type { Method } from "@app/shared/models/method";
import type { PublicNewsListItem } from "@app/shared/models/news";
import type { Project } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { PublicPublicationWithAuthors } from "@gmcan/contracts/public";

export type HomePublicacion = PublicPublicationWithAuthors & {
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
  photoUrl: string;
  photoAlt: string;
};

export type HomeProyecto = Project & {
  fechaI: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
  members: HomeProjectMember[];
};

export type HomeNewsItem = PublicNewsListItem & {
  newsTypeNameLabel: string;
  authorNameLabel: string;
  publishedAtLabel: string;
};

export type HomeViewModel = {
  info: Group;
  publicaciones: HomePublicacion[];
  proyectos: HomeProyecto[];
  newsItems: HomeNewsItem[];
  featuredNews: HomeNewsItem | null;
  lineasInvestigacion: ResearchLine[];
  linesPreview: ResearchLine[];
  metodos: Method[];
  miembros: Member[];
  aboutUs: string[];
  articulos: number;
  tesis: number;
  resumenes: number;
};
