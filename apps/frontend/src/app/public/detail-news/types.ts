import type { Noticia } from "@app/shared/models/noticia";
import type { Usuario } from "@app/shared/models/usuario";

export type DetailNewsViewModel = {
  noticia: Noticia;
  usuario: Usuario | null;
  tipoNoticia: string;
  dia: string;
  mes: string;
  anio: string;
};
