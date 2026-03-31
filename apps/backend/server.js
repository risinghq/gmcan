const { Hono } = require("hono");
const { serve } = require("@hono/node-server");
const { cors } = require("hono/cors");

const GrupoRoutes = require("./routes/grupo");
const AutorRoutes = require("./routes/autor");
const NoticiaRoutes = require("./routes/noticia");
const TipoNoticiaRoutes = require("./routes/tiponoticia");
const PublicacionRoutes = require("./routes/publicacion");
const PublicacionHasAutorRoutes = require("./routes/publicacionhasautor");
const PublicacionHasUsuarioRoutes = require("./routes/publicacionhasusuario");
const TipoUsuarioRoutes = require("./routes/tipousuario");
const TipoPublicacionRoutes = require("./routes/tipopublicacion");
const UsuarioRoutes = require("./routes/usuario");
const UsuarioHasGrupoRoutes = require("./routes/usuariohasgrupo");
const RevistaRoutes = require("./routes/revista");
const UniversidadRoutes = require("./routes/universidad");
const TipoMiembroRoutes = require("./routes/tipomiembro");
const PrefijoRoutes = require("./routes/prefijo");
const EventoRoutes = require("./routes/evento");
const TipoTesisRoutes = require("./routes/tipotesis");
const EmailRoutes = require("./routes/email");
const ProyectoRoutes = require("./routes/proyecto");
const LineasInvestigacionRoutes = require("./routes/lineasinvestigacion");
const UsuarioHasProyectoRoutes = require("./routes/usuariohasproyecto");
const SobreNosotrosRoutes = require("./routes/sobrenosotros");
const MetodosRoutes = require("./routes/metodos");
const EquiposRoutes = require("./routes/equipos");
const SoftwareRoutes = require("./routes/software");
const PermisoRoutes = require("./routes/permiso");
const UsuarioHasPermisoRoutes = require("./routes/usuariohaspermiso");
const TipoPermisoRoutes = require("./routes/tipopermiso");
const GeneroRoutes = require("./routes/genero");
const FuenteFinanciamientoRoutes = require("./routes/fuentefinanciamiento");
const MonedaRoutes = require("./routes/moneda");

const app = new Hono();

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
