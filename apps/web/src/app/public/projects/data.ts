import { Injectable, inject } from "@angular/core";
import type { ProjectWithMembers } from "@app/shared/models/project";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { SessionService } from "@app/shared/services/session.service";
import { dateLabel } from "@app/shared/utils/date";
import { firstValueFrom } from "rxjs";

import type { ProjectDisplay, ProjectsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class ProjectsDataService {
  private readonly projectService = inject(ProjectService);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly groupService = inject(GroupService);
  private readonly lookup = inject(LookupService);
  private readonly session = inject(SessionService);

  async load(): Promise<ProjectsViewModel> {
    const [projectsRaw, lineasRaw, group] = await Promise.all([
      firstValueFrom(this.projectService.listProjects()),
      firstValueFrom(this.researchLinesService.list()),
      firstValueFrom(this.groupService.getGroup()),
    ]);

    const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
    const lineas = Array.isArray(lineasRaw) ? lineasRaw : [];

    const lineasMap = new Map(lineas.map((l) => [l.id, l]));
    const fuentesMap = new Map(this.lookup.fundingSources().map((f) => [f.code, f]));
    const monedasMap = new Map(this.lookup.currencies().map((m) => [m.code, m]));

    const locale = this.session.language().locale;
    const enrich = (p: ProjectWithMembers): ProjectDisplay => {
      return {
        ...p,
        fechaI: dateLabel(p.startDate, "MMMM, y", locale),
        fechaF: dateLabel(p.endDate, "MMMM, y", locale) || undefined,
        lineasInvestigacion: lineasMap.get(p.researchLineId)?.name,
        fuenteFinanciamiento: fuentesMap.get(p.fundingSourceCode)?.name,
        moneda: monedasMap.get(p.currencyCode)?.symbol,
      };
    };

    const sorted = projects.toSorted((a, b) => ((b.startDate ?? "") > (a.startDate ?? "") ? 1 : -1));
    const active = sorted.filter((p) => !p.endDate).map(enrich);
    const finished = sorted.filter((p) => !!p.endDate).map(enrich);

    return {
      active,
      finished,
      infoText: group.projectsSection ?? "",
    };
  }
}
