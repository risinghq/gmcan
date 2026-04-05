import { Injectable, inject } from "@angular/core";
import type { Proyecto } from "@app/shared/models/proyecto";
import { GrupoService } from "@app/shared/services/grupo.service";
import { ProyectoService } from "@app/shared/services/proyecto.service";
import { firstValueFrom } from "rxjs";

import type { ProjectsViewModel } from "./projects-data.types";

@Injectable({ providedIn: "root" })
export class ProjectsDataService {
  private readonly _proyectoService = inject(ProyectoService);
  private readonly _grupoService = inject(GrupoService);

  async load(): Promise<ProjectsViewModel> {
    const [proyectosRaw, grupoRaw] = await Promise.all([
      firstValueFrom(this._proyectoService.getProyecto()),
      firstValueFrom(this._grupoService.getGrupoInfo()),
    ]);

    const proyectos = Array.isArray(proyectosRaw) ? (proyectosRaw as Proyecto[]) : [];
    const grupo = Array.isArray(grupoRaw) ? grupoRaw : [];

    return {
      proyectos,
      infoText: grupo[0]?.seccionProyectos ?? "",
    };
  }
}
