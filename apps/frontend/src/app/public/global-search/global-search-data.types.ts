import type { Noticia } from "@app/shared/models/noticia";
import type { Proyecto } from "@app/shared/models/proyecto";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";

export type GlobalSearchViewModel = {
  publications: Publicacion[];
  projects: Proyecto[];
  news: Noticia[];
  members: UsuarioFull[];
};
