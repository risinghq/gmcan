import { Injectable, inject } from "@angular/core";
import type { Publicacion } from "@app/shared/models/publicacion";
import { GrupoService } from "@app/shared/services/grupo.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { PublicacionService } from "@app/shared/services/publicacion.service";
import { firstValueFrom } from "rxjs";

import type { PublicationViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class PublicationDataService {
  private readonly _publicacionService = inject(PublicacionService);
  private readonly _grupoService = inject(GrupoService);
  private readonly _lookup = inject(LookupService);

  async load(): Promise<PublicationViewModel> {
    const [publicacionesRaw, grupoRaw] = await Promise.all([
      firstValueFrom(this._publicacionService.getPublicacion()),
      firstValueFrom(this._grupoService.getGrupoInfo()),
    ]);

    const publicaciones = Array.isArray(publicacionesRaw) ? (publicacionesRaw as Publicacion[]) : [];
    const grupo = Array.isArray(grupoRaw) ? grupoRaw : [];

    return {
      publicaciones,
      tipoPublicaciones: this._lookup.tiposPublicacion() ?? [],
      infoText: grupo[0]?.seccionPublicaciones ?? "",
    };
  }
}
