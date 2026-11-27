import { Injectable, inject } from "@angular/core";
import { GroupService } from "@app/shared/services/group.service";
import { ProjectService } from "@app/shared/services/project.service";
import { firstValueFrom } from "rxjs";

import type { ProjectsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class ProjectsDataService {
  private readonly projectService = inject(ProjectService);
  private readonly groupService = inject(GroupService);

  async load(): Promise<ProjectsViewModel> {
    const [projectsRaw, group] = await Promise.all([
      firstValueFrom(this.projectService.listProjects()),
      firstValueFrom(this.groupService.getGroup()),
    ]);

    const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
    const sorted = projects.toSorted((a, b) => ((b.startDate ?? "") > (a.startDate ?? "") ? 1 : -1));

    return {
      active: sorted.filter((p) => !p.endDate),
      finished: sorted.filter((p) => !!p.endDate),
      infoText: group.projectsSection ?? "",
    };
  }
}
