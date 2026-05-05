import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { ProjectsDataService } from "./data";
import type { ProjectsViewModel } from "./types";

export const projectsResolver: ResolveFn<ProjectsViewModel> = async () => {
  return inject(ProjectsDataService).load();
};
