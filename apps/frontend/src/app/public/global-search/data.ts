import { Injectable, inject } from "@angular/core";
import type { Noticia } from "@app/shared/models/noticia";
import type { Proyecto } from "@app/shared/models/proyecto";
import type { Publicacion } from "@app/shared/models/publicacion";
import type { SearchResults } from "@app/shared/models/search-results";
import type { Usuario } from "@app/shared/models/usuario";
import type { UsuarioFull } from "@app/shared/models/usuarioFull";
import { SearchService } from "@app/shared/services/search.service";
import { firstValueFrom } from "rxjs";

import type { GlobalSearchViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class GlobalSearchDataService {
  private readonly _searchService = inject(SearchService);

  async load(searchId: string): Promise<GlobalSearchViewModel> {
    const resultsRaw = await firstValueFrom(this._searchService.search(searchId));
    const results = resultsRaw as SearchResults;

    return {
      publications: (results?.publications ?? []).map((hit) => this._mapPublication(hit)),
      projects: (results?.projects ?? []).map((hit) => this._mapProject(hit)),
      news: (results?.news ?? []).map((hit) => this._mapNews(hit)),
      members: (results?.members ?? []).map((hit) => this._mapMember(hit)),
    };
  }

  private _mapProject(hit: SearchResults["projects"][number]): Proyecto {
    const users: Usuario[] = (hit.usuario ?? []).map((user) => ({
      DNI: user.DNI,
      nombreCompleto: user.nombreCompleto,
      foto: user.foto ?? undefined,
    }));

    return {
      idProyecto: hit.idProyecto,
      titulo: hit.titulo,
      tituloEN: hit.tituloEN ?? undefined,
      codigo: hit.codigo,
      montoFinanciado: hit.montoFinanciado,
      descripcion: hit.descripcion,
      descripcionEN: hit.descripcionEN ?? undefined,
      estado: hit.estado ?? undefined,
      fechaInicio: new Date(hit.fechaInicio),
      fechaFin: hit.fechaFin ? new Date(hit.fechaFin) : undefined,
      lineasInvestigacion_idLineasInvestigacion: hit.lineasInvestigacion_idLineasInvestigacion,
      fuenteFinanciamiento_idFuenteFinanciamiento: hit.fuenteFinanciamiento_idFuenteFinanciamiento,
      moneda_idMoneda: hit.moneda_idMoneda,
      lineasInvestigacion: hit.lineasInvestigacion,
      fuenteFinanciamiento: hit.fuenteFinanciamiento,
      usuario: users,
    };
  }

  private _mapMember(hit: SearchResults["members"][number]): UsuarioFull {
    return {
      DNI: hit.DNI,
      correo: hit.correo,
      nombre: hit.nombre,
      apellidoPaterno: hit.apellidoPaterno,
      apellidoMaterno: hit.apellidoMaterno ?? undefined,
      fechaNacimiento: hit.fechaNacimiento,
      resumenPro: hit.resumenPro ?? undefined,
      resumenProEN: hit.resumenProEN ?? undefined,
      foto: hit.foto ?? undefined,
      estado: hit.estado,
      tipoUsuario_idTipoUsuario: hit.tipoUsuario_idTipoUsuario,
      tipoMiembro_idTipoMiembro: hit.tipoMiembro_idTipoMiembro,
      prefijo_idPrefijo: hit.prefijo_idPrefijo ?? undefined,
    };
  }

  private _mapNews(hit: SearchResults["news"][number]): Noticia {
    return {
      idNoticia: hit.idNoticia,
      titulo: hit.titulo ?? undefined,
      fechaPublicacion: hit.fechaPublicacion ?? undefined,
      foto: hit.foto ?? undefined,
      autorPublicacion: hit.autorPublicacion ?? undefined,
      tipoNoticia_idtipoNoticia: hit.tipoNoticia_idtipoNoticia ?? undefined,
      estado: hit.estado ?? undefined,
      autor: hit.autor,
    };
  }

  private _mapPublication(hit: SearchResults["publications"][number]): Publicacion {
    return {
      idPublicacion: hit.idPublicacion,
      titulo: hit.titulo,
      archivo: hit.archivo ?? undefined,
      resumen: hit.resumen ?? undefined,
      resumenEN: hit.resumenEN ?? undefined,
      DOI: hit.DOI ?? undefined,
      fechaPublicacion: hit.fechaPublicacion,
      tipoPublicacion_idTipoPublicacion: hit.tipoPublicacion_idTipoPublicacion,
      nroRevista: hit.nroRevista ?? undefined,
      revista_idRevista: hit.revista_idRevista ?? undefined,
      universidad_idUniversidad: hit.universidad_idUniversidad ?? undefined,
      evento_idEvento: hit.evento_idEvento ?? undefined,
      tipoTesis_idTipoTesis: hit.tipoTesis_idTipoTesis ?? undefined,
      autor: hit.autor,
    };
  }
}
