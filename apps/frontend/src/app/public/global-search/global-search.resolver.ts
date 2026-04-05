import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import { GlobalSearchDataService } from "./global-search-data.service";
import type { GlobalSearchViewModel } from "./global-search-data.types";

export const globalSearchResolver: ResolveFn<GlobalSearchViewModel> = async (route: ActivatedRouteSnapshot) => {
  const searchId = route.params["id"] as string;
  return inject(GlobalSearchDataService).load(searchId);
};
