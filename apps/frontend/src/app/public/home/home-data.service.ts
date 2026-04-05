import { DatePipe, TitleCasePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { LineasInvestigacion } from "@app/shared/models/lineaInvestigacion";
import type { Method } from "@app/shared/models/method";
import type { Noticia } from "@app/shared/models/noticia";
import type { Proyecto } from "@app/shared/models/proyecto";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { TipoNoticia } from "@app/shared/models/tiponoticia";
import type { TipoPublicacion } from "@app/shared/models/tipopublicacion";
import type { Usuario } from "@app/shared/models/usuario";
import { AboutUsService } from "@app/shared/services/aboutus.service";
import { EventoService } from "@app/shared/services/evento.service";
import { FuenteFinanciamientoService } from "@app/shared/services/fuentefinanciamiento.service";
import { GrupoService } from "@app/shared/services/grupo.service";
import { LineasInvestigacionService } from "@app/shared/services/lineasinvestigacion.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { PublicacionAutoresService } from "@app/shared/services/publicacion-autores.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { UsuarioHasProyectoService } from "@app/shared/services/usuariohasproyecto";
import { firstValueFrom } from "rxjs";

import type { HomeNoticia, HomeProyecto, HomePublicacion, HomeViewModel } from "./home-data.types";

@Injectable({ providedIn: "root" })
export class HomeDataService {
  private readonly _grupoService = inject(GrupoService);
  private readonly _publicacionService = inject(PublicacionService);
  private readonly _proyectoService = inject(ProyectoService);
  private readonly _noticiaService = inject(NoticiaService);
  private readonly _lineasService = inject(LineasInvestigacionService);
  private readonly _methodsService = inject(MethodsService);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _lookup = inject(LookupService);
  private readonly _aboutUsService = inject(AboutUsService);
  private readonly _publicacionAutoresService = inject(PublicacionAutoresService);
  private readonly _proyectoHasUsuarioService = inject(UsuarioHasProyectoService);
  private readonly _fuenteFinanciamientoService = inject(FuenteFinanciamientoService);
  private readonly _eventoService = inject(EventoService);
  private readonly _datePipe = inject(DatePipe);
  private readonly _titlecasePipe = inject(TitleCasePipe);

  async load(): Promise<HomeViewModel> {
    const [grupoRaw, tipoPublicaciones, tipoNoticias, lineasInvestigacionRaw, metodosRaw, usuariosRaw] =
      await Promise.all([
        firstValueFrom(this._grupoService.getGrupoInfo()),
        Promise.resolve(this._lookup.tiposPublicacion()),
        Promise.resolve(this._lookup.tiposNoticia()),
        firstValueFrom(this._lineasService.getLineasInvestigacion()),
        firstValueFrom(this._methodsService.getMethods()),
        firstValueFrom(this._usuarioService.getUsuarios()),
      ]);

    const [publicacionesRaw, proyectosRaw, noticiasRaw, aboutUsRaw] = await Promise.all([
      firstValueFrom(this._publicacionService.getPublicacion()),
      firstValueFrom(this._proyectoService.getProyecto()),
      firstValueFrom(this._noticiaService.getNoticias()),
      firstValueFrom(this._aboutUsService.getAboutUsInfo()),
    ]);

    const grupo = Array.isArray(grupoRaw) ? grupoRaw : [];
    const lineasInvestigacion = Array.isArray(lineasInvestigacionRaw)
      ? (lineasInvestigacionRaw as LineasInvestigacion[])
      : [];
    const metodos = Array.isArray(metodosRaw) ? (metodosRaw as Method[]) : [];
    const usuarios = Array.isArray(usuariosRaw) ? (usuariosRaw as Usuario[]) : [];
    const publicacionesSafe = Array.isArray(publicacionesRaw) ? (publicacionesRaw as Publicacion[]) : [];
    const proyectosSafe = Array.isArray(proyectosRaw) ? (proyectosRaw as Proyecto[]) : [];
    const noticiasSafe = Array.isArray(noticiasRaw) ? (noticiasRaw as Noticia[]) : [];
    const aboutUs = Array.isArray(aboutUsRaw) ? (aboutUsRaw as Array<{ servicios?: string }>) : [];

    const publicaciones = await this._enrichPublicaciones(publicacionesSafe, tipoPublicaciones ?? []);
    const proyectos = await this._enrichProyectos(
      proyectosSafe.filter((proyecto) => !proyecto.fechaFin),
      lineasInvestigacion,
    );
    const noticias = await this._enrichNoticias(
      noticiasSafe.filter((noticia) => noticia.estado === 1),
      tipoNoticias ?? [],
    );

    const orderedPublicaciones = publicaciones.toSorted((a, b) => {
      const left = new Date(a.fechaPublicacion ?? "").getTime();
      const right = new Date(b.fechaPublicacion ?? "").getTime();
      return right - left;
    });

    const orderedProyectos = proyectos.toSorted((a, b) => {
      const left = new Date(a.fechaInicio ?? "").getTime();
      const right = new Date(b.fechaInicio ?? "").getTime();
      return right - left;
    });

    const orderedNoticias = noticias.toSorted((a, b) => {
      const left = new Date(a.fechaPublicacion ?? "").getTime();
      const right = new Date(b.fechaPublicacion ?? "").getTime();
      return right - left;
    });

    return {
      info: grupo?.[0] ?? {},
      publicaciones: orderedPublicaciones,
      proyectos: orderedProyectos,
      noticias: orderedNoticias,
      noticiaPrincipal: orderedNoticias[0] ?? null,
      lineasInvestigacion,
      metodos,
      usuarios,
      aboutUs: aboutUs?.[0]?.servicios ?? "",
      articulos: orderedPublicaciones.filter((p) => p.tipoPublicacion_idTipoPublicacion === 1).length,
      tesis: orderedPublicaciones.filter((p) => p.tipoPublicacion_idTipoPublicacion === 2).length,
      resumenes: orderedPublicaciones.filter((p) => p.tipoPublicacion_idTipoPublicacion === 3).length,
    };
  }

  private async _enrichPublicaciones(
    publicaciones: Publicacion[],
    tiposPublicacion: TipoPublicacion[],
  ): Promise<HomePublicacion[]> {
    const tiposMap = new Map(tiposPublicacion.map((tipo) => [tipo.idTipoPublicacion, tipo]));
    const revistasMap = new Map(this._lookup.revistas().map((revista) => [revista.idRevista, revista]));
    const universidadesMap = new Map(
      this._lookup.universidades().map((universidad) => [universidad.idUniversidad, universidad]),
    );
    const tiposTesisMap = new Map(this._lookup.tiposTesis().map((tipo) => [tipo.idTipoTesis, tipo]));

    return Promise.all(
      publicaciones.map(async (publicacion) => {
        const fechaPublicacion = new Date(publicacion.fechaPublicacion ?? "");
        if (String(fechaPublicacion) !== "Invalid Date") {
          fechaPublicacion.setMinutes(fechaPublicacion.getMinutes() + fechaPublicacion.getTimezoneOffset());
        }

        const [autores, evento] = await Promise.all([
          firstValueFrom(this._publicacionAutoresService.getForPublication(publicacion.idPublicacion ?? 0)),
          publicacion.evento_idEvento
            ? firstValueFrom(this._eventoService.getEvento(publicacion.evento_idEvento))
            : Promise.resolve(null),
        ]);

        const eventoValue = Array.isArray(evento)
          ? (evento as Array<{ nombre?: string; ciudad?: string; pais?: string }>)
          : [];

        return {
          ...publicacion,
          fechaPublicacion: String(fechaPublicacion) === "Invalid Date" ? "" : fechaPublicacion.toISOString(),
          fecha: this._titlecasePipe.transform(this._datePipe.transform(fechaPublicacion, "MMMM y", "es") ?? ""),
          tipoPublicacion: tiposMap.get(publicacion.tipoPublicacion_idTipoPublicacion ?? 0)?.nombre,
          revista: revistasMap.get(publicacion.revista_idRevista ?? 0)?.nombre,
          universidad: universidadesMap.get(publicacion.universidad_idUniversidad ?? 0)?.nombre ?? undefined,
          tipoTesis: tiposTesisMap.get(publicacion.tipoTesis_idTipoTesis ?? 0)?.nombre,
          autor: (Array.isArray(autores) ? autores : []) as HomePublicacion["autor"],
          evento: eventoValue[0]?.nombre,
          ciudad: eventoValue[0]?.ciudad,
          pais: eventoValue[0]?.pais,
        };
      }),
    );
  }

  private async _enrichProyectos(
    proyectos: Proyecto[],
    lineasInvestigacion: LineasInvestigacion[],
  ): Promise<HomeProyecto[]> {
    const lineasMap = new Map(lineasInvestigacion.map((linea) => [linea.idLineasInvestigacion, linea]));
    const monedasMap = new Map(this._lookup.monedas().map((moneda) => [moneda.idMoneda, moneda]));

    return Promise.all(
      proyectos.map(async (proyecto) => {
        const fechaInicio = new Date(proyecto.fechaInicio ?? "");
        if (String(fechaInicio) !== "Invalid Date") {
          fechaInicio.setMinutes(fechaInicio.getMinutes() + fechaInicio.getTimezoneOffset());
        }

        const usuariosProyectoRaw = await firstValueFrom(
          this._proyectoHasUsuarioService.getUsuarioHasProyectos(proyecto.idProyecto ?? 0),
        );
        const usuariosProyecto = Array.isArray(usuariosProyectoRaw)
          ? (usuariosProyectoRaw as Array<{ usuario_DNI?: string }>)
          : [];

        const usuario =
          (usuariosProyecto?.length ?? 0) > 0
            ? await Promise.all(
                usuariosProyecto.map(async (usuarioProyecto) => {
                  const users = await firstValueFrom(this._usuarioService.getUser(usuarioProyecto.usuario_DNI ?? ""));
                  const user = users?.[0];
                  if (!user) {
                    return null;
                  }

                  const hydratedUser = Object.assign({}, user) as Usuario;
                  hydratedUser.nombre = `${(user.nombre ?? "").split(" ")[0]}.`;
                  hydratedUser.nombreCompleto =
                    `${(user.nombre ?? "").split(" ")[0]} ${user.apellidoPaterno ?? ""}`.trim();
                  return hydratedUser;
                }),
              )
            : [];

        const fuenteFinanciamiento = proyecto.fuenteFinanciamiento_idFuenteFinanciamiento
          ? await firstValueFrom(
              this._fuenteFinanciamientoService.getFuenteFinanciamiento(
                proyecto.fuenteFinanciamiento_idFuenteFinanciamiento,
              ),
            )
          : null;

        return {
          ...proyecto,
          fechaI: this._titlecasePipe.transform(this._datePipe.transform(fechaInicio, "MMMM, y", "es") ?? ""),
          lineasInvestigacion: lineasMap.get(proyecto.lineasInvestigacion_idLineasInvestigacion ?? 0)?.nombre,
          usuario: usuario.filter((item: Usuario | null): item is Usuario => Boolean(item)),
          fuenteFinanciamiento: Array.isArray(fuenteFinanciamiento)
            ? (fuenteFinanciamiento as Array<{ nombre?: string }>)[0]?.nombre
            : undefined,
          moneda: monedasMap.get(proyecto.moneda_idMoneda ?? 0)?.simbolo,
        };
      }),
    );
  }

  private async _enrichNoticias(noticias: Noticia[], tiposNoticia: TipoNoticia[]): Promise<HomeNoticia[]> {
    const tiposMap = new Map(tiposNoticia.map((tipo) => [tipo.idtipoNoticia, tipo]));

    return Promise.all(
      noticias.map(async (noticia) => {
        const fechaPublicacion = new Date(noticia.fechaPublicacion ?? "");
        if (String(fechaPublicacion) !== "Invalid Date") {
          fechaPublicacion.setMinutes(fechaPublicacion.getMinutes() + fechaPublicacion.getTimezoneOffset());
        }

        const autores = await firstValueFrom(this._usuarioService.getUser(noticia.autorPublicacion ?? ""));

        return {
          ...noticia,
          fechaPublicacion: this._datePipe.transform(fechaPublicacion, "MMMM dd, y", "es") ?? "",
          nombreTipoNoticia: tiposMap.get(noticia.tipoNoticia_idtipoNoticia)?.nombre ?? "",
          autor: autores?.[0] ? `${autores[0].nombre ?? ""} ${autores[0].apellidoPaterno ?? ""}`.trim() : "",
        };
      }),
    );
  }
}
