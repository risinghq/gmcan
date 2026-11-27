import type { Group } from "@app/shared/models/group";
import type { PublicationDisplay } from "@app/shared/publication-display";
import type {
  PublicGroupTopic,
  PublicNewsListItem,
  PublicProject,
  PublicPublicationWithAuthors,
  PublicationKindCode,
} from "@gmcan/contracts/public";

export type HomePublicacion = PublicationDisplay<PublicPublicationWithAuthors>;

export type HomeProyecto = PublicProject & {
  fechaI: string;
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
  counters: HomeCounter[];
  aboutUs: string[];
};

export type HomeCounter = {
  value: number;
  label: string;
  link: string;
  queryParams?: { type: PublicationKindCode };
};
