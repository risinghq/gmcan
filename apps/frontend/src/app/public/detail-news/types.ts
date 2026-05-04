import type { News } from "@app/shared/models/news";

export type DetailNewsViewModel = {
  noticia: News;
  tipoNoticia: string;
  autorName: string;
  autorPhoto: string | null;
  autorPhotoUrl?: string | null;
  autorId: number | null;
  dia: string;
  mes: string;
  anio: string;
};
