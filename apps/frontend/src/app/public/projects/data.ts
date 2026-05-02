import { DatePipe, TitleCasePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import type { ProjectWithMembers } from "@app/shared/models/project";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { parseLocalDate, requireLocalDate } from "@app/shared/utils/date";
import { firstValueFrom } from "rxjs";

import type { ProjectDisplay, ProjectsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class ProjectsDataService {
  private readonly projectService = inject(ProjectService);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly groupService = inject(GroupService);
  private readonly lookup = inject(LookupService);
  private readonly datePipe = inject(DatePipe);
  private readonly titlecasePipe = inject(TitleCasePipe);

  async load(): Promise<ProjectsViewModel> {
    const [projectsRaw, lineasRaw, group] = await Promise.all([
      firstValueFrom(this.projectService.listProjects()),
      firstValueFrom(this.researchLinesService.list()),
      firstValueFrom(this.groupService.getGroup()),
    ]);

    const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
    const lineas = Array.isArray(lineasRaw) ? lineasRaw : [];

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(this.lookup.fundingSources().map((f) => [f.id, f]));
    const monedasMap = new Map(this.lookup.monedas().map((m) => [m.idMoneda, m]));

    const enrich = (p: ProjectWithMembers): ProjectDisplay => {
      const startDate = requireLocalDate(p.startDate, "project.startDate");
      let fechaF: string | undefined;
      if (p.endDate) {
        const endDate = parseLocalDate(p.endDate);
        fechaF = endDate
          ? (this.titlecasePipe.transform(this.datePipe.transform(endDate, "MMMM, y", "es") ?? "") ?? undefined)
          : undefined;
      }
      return {
        ...p,
        fechaI: this.titlecasePipe.transform(this.datePipe.transform(startDate, "MMMM, y", "es") ?? "") ?? "",
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
