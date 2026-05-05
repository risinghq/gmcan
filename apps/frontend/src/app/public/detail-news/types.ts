import type { PublicNewsDetail } from "@app/shared/models/news";

export type DetailNewsViewModel = {
  noticia: PublicNewsDetail;
  tipoNoticia: string;
  autorName: string;
  autorPhoto: string | null;
  autorId: number | null;
  dia: string;
  mes: string;
  anio: string;
};
