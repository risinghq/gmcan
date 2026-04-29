import type { ProjectWithMembers } from "@app/shared/models/project";

export type ProjectDisplay = ProjectWithMembers & {
  fechaI: string;
  fechaF?: string;
  lineasInvestigacion?: string;
  fuenteFinanciamiento?: string;
  moneda?: string;
};

export type ProjectsViewModel = {
  active: ProjectDisplay[];
  finished: ProjectDisplay[];
  infoText: string;
};
