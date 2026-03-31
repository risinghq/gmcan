const express = require("express");
const bodyParser = require("body-parser");
const mysqlConnection = require("./connection");

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

var app = express();
app.use(bodyParser.json());

app.use((req,res,next)=>{
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
	next();
});



app.use("/grupo", GrupoRoutes);
app.use("/autor", AutorRoutes);
app.use("/noticia", NoticiaRoutes);
app.use("/tipo-noticia", TipoNoticiaRoutes);
app.use("/publicacion", PublicacionRoutes);
app.use("/publicacion-autor", PublicacionHasAutorRoutes);
app.use("/publicacion-usuario", PublicacionHasUsuarioRoutes);
app.use("/tipo-usuario", TipoUsuarioRoutes);
app.use("/tipo-publicacion", TipoPublicacionRoutes);
app.use("/usuario", UsuarioRoutes);
app.use("/usuario-grupo", UsuarioHasGrupoRoutes);
app.use("/revista", RevistaRoutes);
app.use("/universidad", UniversidadRoutes);
app.use("/tipo-miembro", TipoMiembroRoutes);
app.use("/prefijo", PrefijoRoutes);
app.use("/evento", EventoRoutes);
app.use("/tipotesis", TipoTesisRoutes);
app.use("/email", EmailRoutes);
app.use("/lineasinvestigacion", LineasInvestigacionRoutes);
app.use("/proyecto", ProyectoRoutes);
app.use("/usuariohasproyecto", UsuarioHasProyectoRoutes);
app.use("/sobrenosotros", SobreNosotrosRoutes);
app.use("/metodo", MetodosRoutes);
app.use("/equipo", EquiposRoutes);
app.use("/software", SoftwareRoutes);
app.use("/permiso", PermisoRoutes);
app.use("/usuariohaspermiso", UsuarioHasPermisoRoutes);
app.use("/tipopermiso", TipoPermisoRoutes);
app.use("/genero", GeneroRoutes);
app.use("/fuentefinanciamiento", FuenteFinanciamientoRoutes);
app.use("/moneda", MonedaRoutes);

app.listen(3000);