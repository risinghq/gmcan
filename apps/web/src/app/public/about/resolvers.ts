import { inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
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
import { forkJoin, map, switchMap } from "rxjs";

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

export const aboutUsResolver: ResolveFn<About> = () => {
  const groupService = inject(GroupService);

  return groupService.getGroup().pipe(
    switchMap((group) => groupService.listPublicAbout(group.id)),
    map((items) => {
      const about = items[0];
      if (!about) throw new Error("About section not found");
      return about;
    }),
  );
};

export const facilitiesResolver: ResolveFn<FacilitiesData> = () => {
  const groupService = inject(GroupService);

  return groupService.getGroup().pipe(
    switchMap((group) =>
      forkJoin({
        equipment: groupService.listPublicEquipment(group.id),
        software: groupService.listPublicSoftware(group.id),
      }).pipe(map(({ equipment, software }) => ({ group, equipment, software }))),
    ),
  );
};

export const methodsResolver: ResolveFn<Method[]> = () => {
  return inject(MethodsService).list();
};

export const worksResolver: ResolveFn<Group> = () => {
  return inject(GroupService).getGroup();
};

export const linesResolver: ResolveFn<ResearchLineDisplay[]> = () => {
  const researchLinesService = inject(ResearchLinesService);
  const projectService = inject(ProjectService);
  const lookup = inject(LookupService);

  return forkJoin({
    lineas: researchLinesService.list(),
    projects: projectService.listProjects(),
  }).pipe(
    map(({ lineas, projects }) => {
      const fuentesMap = new Map(lookup.fundingSources().map((f) => [f.code, f]));
      const monedasMap = new Map(lookup.currencies().map((m) => [m.code, m]));

      const enrichedProjects: ProjectDisplay[] = projects.map((project) => ({
        ...project,
        fechaI: formatMonth(project.startDate),
        fechaF: project.endDate ? formatMonth(project.endDate) : undefined,
        lineasInvestigacion: lineas.find((line) => line.id === project.researchLineId)?.name,
        fuenteFinanciamiento: fuentesMap.get(project.fundingSourceCode)?.name,
        moneda: monedasMap.get(project.currencyCode)?.symbol,
      }));

      return lineas.slice(0, 3).map((line) =>
        Object.assign({}, line, {
          description: line.description ?? "",
          proyectos: enrichedProjects.filter((project) => project.researchLineId === line.id && !project.endDate),
        }),
      );
    }),
  );
};
