import type { Proyecto } from "./proyecto";
import type { Publicacion } from "./publicacion";
import type { UsuarioFull } from "./usuarioFull";

export interface MemberProfile {
  usuario: UsuarioFull;
  proyectos: Proyecto[];
  publicaciones: Publicacion[];
}
