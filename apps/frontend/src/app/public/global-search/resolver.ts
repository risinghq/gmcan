import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import { GlobalSearchDataService } from "./data";
import type { GlobalSearchViewModel } from "./types";

export const globalSearchResolver: ResolveFn<GlobalSearchViewModel> = async (route: ActivatedRouteSnapshot) => {
  const searchId = route.params["id"] as string;
  return inject(GlobalSearchDataService).load(searchId);
};
