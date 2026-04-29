import { DatePipe, TitleCasePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { ProjectWithMembers } from "@app/shared/models/project";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { firstValueFrom } from "rxjs";

import type { ProjectDisplay, ProjectsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class ProjectsDataService {
  private readonly _projectService = inject(ProjectService);
  private readonly _researchLinesService = inject(ResearchLinesService);
  private readonly _groupService = inject(GroupService);
  private readonly _lookup = inject(LookupService);
  private readonly _datePipe = inject(DatePipe);
  private readonly _titlecasePipe = inject(TitleCasePipe);

  async load(): Promise<ProjectsViewModel> {
    const [projectsRaw, lineasRaw, group] = await Promise.all([
      firstValueFrom(this._projectService.listProjects()),
      firstValueFrom(this._researchLinesService.list()),
      firstValueFrom(this._groupService.getGroup()),
    ]);

    const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
    const lineas = Array.isArray(lineasRaw) ? lineasRaw : [];

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(this._lookup.fundingSources().map((f) => [f.id, f]));
    const monedasMap = new Map(this._lookup.monedas().map((m) => [m.idMoneda, m]));

    const enrich = (p: ProjectWithMembers): ProjectDisplay => {
      const startDate = new Date(p.startDate ?? "");
      if (String(startDate) !== "Invalid Date") {
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
      }
      let fechaF: string | undefined;
      if (p.endDate) {
        const end = new Date(p.endDate);
        if (String(end) !== "Invalid Date") {
          end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
          fechaF = this._titlecasePipe.transform(this._datePipe.transform(end, "MMMM, y", "es") ?? "") ?? undefined;
        }
      }
      return {
        ...p,
        fechaI:
          String(startDate) === "Invalid Date"
            ? ""
            : (this._titlecasePipe.transform(this._datePipe.transform(startDate, "MMMM, y", "es") ?? "") ?? ""),
        fechaF,
        lineasInvestigacion: lineasMap.get(p.researchLineId)?.name,
        fuenteFinanciamiento: fuentesMap.get(p.fundingSourceId)?.name,
        moneda: monedasMap.get(p.currencyId)?.simbolo,
      };
    };

    const sorted = projects.toSorted((a, b) => ((b.startDate ?? "") > (a.startDate ?? "") ? 1 : -1));
    const active = sorted.filter((p) => !p.endDate).map(enrich);
    const finished = sorted.filter((p) => !!p.endDate).map(enrich);

    return {
      active,
      finished,
      infoText: group.projectsSectionES ?? "",
    };
  }
}
