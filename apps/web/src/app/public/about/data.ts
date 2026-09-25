import { Injectable, inject } from "@angular/core";
import { RouteDataError } from "@app/shared/errors/app-error";
import type { About } from "@app/shared/models/about";
import type { Equipment } from "@app/shared/models/equipment";
import type { Group } from "@app/shared/models/group";
import type { Method } from "@app/shared/models/method";
import type { ProjectWithMembers } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { Software } from "@app/shared/models/software";
import { GroupService } from "@app/shared/services/group.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { firstValueFrom } from "rxjs";

export type FacilitiesData = { group: Group; equipment: Equipment[]; software: Software[] };

export interface ResearchLineDisplay extends ResearchLine {
  description: string;
  proyectos: ProjectWithMembers[];
}

function failInvariant(message: string, details?: unknown): never {
  throw new RouteDataError({ code: "invariant_violation", message, details });
}

function toResearchLineDisplay(line: ResearchLine, proyectos: ProjectWithMembers[]): ResearchLineDisplay {
  return { ...line, description: line.description ?? "", proyectos };
}

@Injectable({ providedIn: "root" })
export class AboutDataService {
  private readonly groupService = inject(GroupService);
  private readonly methodsService = inject(MethodsService);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly projectService = inject(ProjectService);

  async getGroup(): Promise<Group> {
    return firstValueFrom(this.groupService.getGroup());
  }

  async getAbout(): Promise<About> {
    const group = await this.getGroup();
    const items = await firstValueFrom(this.groupService.listPublicAbout(group.id));
    const about = items[0];
    if (!about) failInvariant("About section is required");
    if (!about.asset) failInvariant("About asset is required", { aboutId: about.id });
    return about;
  }

  async getFacilities(): Promise<FacilitiesData> {
    const group = await this.getGroup();
    if (!group.assets.facilities) failInvariant("Facilities asset is required", { groupId: group.id });
    const [equipment, software] = await Promise.all([
      firstValueFrom(this.groupService.listPublicEquipment(group.id)),
      firstValueFrom(this.groupService.listPublicSoftware(group.id)),
    ]);
    return { group, equipment, software };
  }

  async getMethods(): Promise<Method[]> {
    return firstValueFrom(this.methodsService.list());
  }

  async getLines(): Promise<ResearchLineDisplay[]> {
    const [lineas, projects] = await Promise.all([
      firstValueFrom(this.researchLinesService.list()),
      firstValueFrom(this.projectService.listProjects()),
    ]);
    const lines = lineas.map((line) =>
      toResearchLineDisplay(
        line,
        projects.filter((p) => p.researchLineId === line.id && !p.endDate),
      ),
    );

    for (const line of lines) {
      if (!line.asset) failInvariant("Research line asset is required", { lineId: line.id });
    }

    return lines;
  }
}
