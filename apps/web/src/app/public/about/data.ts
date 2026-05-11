import { Injectable, inject } from "@angular/core";
import type { NavigationAppError } from "@app/shared/errors/app-error";
import { failInvariant, fromObservable, invariant } from "@app/shared/errors/result-helpers";
import type { About } from "@app/shared/models/about";
import type { Equipment } from "@app/shared/models/equipment";
import type { Group } from "@app/shared/models/group";
import type { Method } from "@app/shared/models/method";
import type { ProjectWithMembers } from "@app/shared/models/project";
import type { ResearchLine } from "@app/shared/models/research-line";
import type { Software } from "@app/shared/models/software";
import { GroupService } from "@app/shared/services/group.service";
import { LookupService } from "@app/shared/services/lookup.service";
import { MethodsService } from "@app/shared/services/methods.service";
import { ProjectService } from "@app/shared/services/project.service";
import { ResearchLinesService } from "@app/shared/services/research-lines.service";
import { ResultAsync, okAsync } from "neverthrow";

export type FacilitiesData = { group: Group; equipment: Equipment[]; software: Software[] };

type ProjectDisplay = ProjectWithMembers & {
  fechaI?: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
};

export type ResearchLineDisplay = ResearchLine & { proyectos: ProjectDisplay[] };

function formatMonth(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const text = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

@Injectable({ providedIn: "root" })
export class AboutDataService {
  private readonly groupService = inject(GroupService);
  private readonly methodsService = inject(MethodsService);
  private readonly researchLinesService = inject(ResearchLinesService);
  private readonly projectService = inject(ProjectService);
  private readonly lookup = inject(LookupService);

  getGroup(): ResultAsync<Group, NavigationAppError> {
    return fromObservable(() => this.groupService.getGroup(), "Failed to load group");
  }

  getAbout(): ResultAsync<About, NavigationAppError> {
    return this.getGroup()
      .andThen((group) =>
        fromObservable(() => this.groupService.listPublicAbout(group.id), "Failed to load about section"),
      )
      .andThen((items) => {
        const about = items[0];
        if (!about) return failInvariant("About section is required");
        return okAsync(about);
      })
      .andThen((about) =>
        invariant(Boolean(about.asset), "About asset is required", { aboutId: about.id }).map(() => about),
      );
  }

  getFacilities(): ResultAsync<FacilitiesData, NavigationAppError> {
    return this.getGroup().andThen((group) =>
      ResultAsync.combine([
        fromObservable(() => this.groupService.listPublicEquipment(group.id), "Failed to load equipment"),
        fromObservable(() => this.groupService.listPublicSoftware(group.id), "Failed to load software"),
      ]).andThen(([equipment, software]) =>
        invariant(Boolean(group.assets.facilities), "Facilities asset is required", { groupId: group.id }).map(() => ({
          group,
          equipment,
          software,
        })),
      ),
    );
  }

  getMethods(): ResultAsync<Method[], NavigationAppError> {
    return fromObservable(() => this.methodsService.list(), "Failed to load methods");
  }

  getLines(): ResultAsync<ResearchLineDisplay[], NavigationAppError> {
    return ResultAsync.combine([
      fromObservable(() => this.researchLinesService.list(), "Failed to load research lines"),
      fromObservable(() => this.projectService.listProjects(), "Failed to load projects"),
    ])
      .andThen(([lineas, projects]) => {
        const fuentesMap = new Map(this.lookup.fundingSources().map((f) => [f.code, f]));
        const monedasMap = new Map(this.lookup.currencies().map((m) => [m.code, m]));

        const enrichedProjects: ProjectDisplay[] = projects.map((project) => ({
          ...project,
          fechaI: formatMonth(project.startDate),
          fechaF: project.endDate ? formatMonth(project.endDate) : undefined,
          lineasInvestigacion: lineas.find((line) => line.id === project.researchLineId)?.name,
          fuenteFinanciamiento: fuentesMap.get(project.fundingSourceCode)?.name,
          moneda: monedasMap.get(project.currencyCode)?.symbol,
        }));

        const lines = lineas.slice(0, 3).map((line) => ({
          ...line,
          description: line.description ?? "",
          proyectos: enrichedProjects.filter((p) => p.researchLineId === line.id && !p.endDate),
        }));

        return okAsync(lines);
      })
      .andThen((lines) => {
        const missingAsset = lines.find((line) => !line.asset);
        if (missingAsset) return failInvariant("Research line asset is required", { lineId: missingAsset.id });

        const memberWithoutAsset = lines
          .flatMap((line) => line.proyectos)
          .flatMap((project) => project.members)
          .find((member) => !member.asset);

        if (memberWithoutAsset) {
          return failInvariant("Project member asset is required", { memberId: memberWithoutAsset.memberId });
        }

        return okAsync(lines);
      });
  }
}
