import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { bootstrap } from "./db/bootstrap.js";
import { onError } from "./lib/handle.js";
import AutorRoutes from "./routes/autor.js";
import EmailRoutes from "./routes/email.js";
import EquiposRoutes from "./routes/equipos.js";
import EventoRoutes from "./routes/evento.js";
import FuenteFinanciamientoRoutes from "./routes/fuentefinanciamiento.js";
import GeneroRoutes from "./routes/genero.js";
import GrupoRoutes from "./routes/grupo.js";
import LineasInvestigacionRoutes from "./routes/lineasinvestigacion.js";
import MetodosRoutes from "./routes/metodos.js";
import MonedaRoutes from "./routes/moneda.js";
import NoticiaRoutes from "./routes/noticia.js";
import PermisoRoutes from "./routes/permiso.js";
import PrefijoRoutes from "./routes/prefijo.js";
import ProyectoRoutes from "./routes/proyecto.js";
import PublicacionRoutes from "./routes/publicacion.js";
import PublicacionHasAutorRoutes from "./routes/publicacionhasautor.js";
import PublicacionHasUsuarioRoutes from "./routes/publicacionhasusuario.js";
import RevistaRoutes from "./routes/revista.js";
import SobreNosotrosRoutes from "./routes/sobrenosotros.js";
import SoftwareRoutes from "./routes/software.js";
import TipoMiembroRoutes from "./routes/tipomiembro.js";
import TipoNoticiaRoutes from "./routes/tiponoticia.js";
import TipoPermisoRoutes from "./routes/tipopermiso.js";
import TipoPublicacionRoutes from "./routes/tipopublicacion.js";
import TipoTesisRoutes from "./routes/tipotesis.js";
import TipoUsuarioRoutes from "./routes/tipousuario.js";
import UniversidadRoutes from "./routes/universidad.js";
import UsuarioRoutes from "./routes/usuario.js";
import UsuarioHasGrupoRoutes from "./routes/usuariohasgrupo.js";
import UsuarioHasPermisoRoutes from "./routes/usuariohaspermiso.js";
import UsuarioHasProyectoRoutes from "./routes/usuariohasproyecto.js";

await bootstrap();

const app = new Hono();

app.onError(onError);

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "Authorization",
      "X-API-KEY",
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Access-Control-Allow-Request-Method",
    ],
    allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  }),
);

app.route("/grupo", GrupoRoutes);
app.route("/autor", AutorRoutes);
app.route("/noticia", NoticiaRoutes);
app.route("/tipo-noticia", TipoNoticiaRoutes);
app.route("/publicacion", PublicacionRoutes);
app.route("/publicacion-autor", PublicacionHasAutorRoutes);
app.route("/publicacion-usuario", PublicacionHasUsuarioRoutes);
app.route("/tipo-usuario", TipoUsuarioRoutes);
app.route("/tipo-publicacion", TipoPublicacionRoutes);
app.route("/usuario", UsuarioRoutes);
app.route("/usuario-grupo", UsuarioHasGrupoRoutes);
app.route("/revista", RevistaRoutes);
app.route("/universidad", UniversidadRoutes);
app.route("/tipo-miembro", TipoMiembroRoutes);
app.route("/prefijo", PrefijoRoutes);
app.route("/evento", EventoRoutes);
app.route("/tipotesis", TipoTesisRoutes);
app.route("/email", EmailRoutes);
app.route("/lineasinvestigacion", LineasInvestigacionRoutes);
app.route("/proyecto", ProyectoRoutes);
app.route("/usuariohasproyecto", UsuarioHasProyectoRoutes);
app.route("/sobrenosotros", SobreNosotrosRoutes);
app.route("/metodo", MetodosRoutes);
app.route("/equipo", EquiposRoutes);
app.route("/software", SoftwareRoutes);
app.route("/permiso", PermisoRoutes);
app.route("/usuariohaspermiso", UsuarioHasPermisoRoutes);
app.route("/tipopermiso", TipoPermisoRoutes);
app.route("/genero", GeneroRoutes);
app.route("/fuentefinanciamiento", FuenteFinanciamientoRoutes);
app.route("/moneda", MonedaRoutes);

serve({ fetch: app.fetch, port: 3000 });
