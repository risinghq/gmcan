import type { Group } from "@app/shared/models/group";
import type {
  PublicGroupTopic,
  PublicNewsListItem,
  PublicProject,
  PublicPublicationWithAuthors,
} from "@gmcan/contracts/public";

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

export type HomeProyecto = PublicProject & {
  fechaI: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
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
  linesPreview: PublicGroupTopic[];
  metodos: PublicGroupTopic[];
  memberCount: number;
  aboutUs: string[];
  articulos: number;
  tesis: number;
  resumenes: number;
};
