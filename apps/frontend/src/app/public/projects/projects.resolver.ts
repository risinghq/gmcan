import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { ProjectsDataService } from "./projects-data.service";
import type { ProjectsViewModel } from "./projects-data.types";

export const projectsResolver: ResolveFn<ProjectsViewModel> = async () => {
  return inject(ProjectsDataService).load();
};
