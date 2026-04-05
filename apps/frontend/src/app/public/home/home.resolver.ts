import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { HomeDataService } from "./home-data.service";
import type { HomeViewModel } from "./home-data.types";

export const homeResolver: ResolveFn<HomeViewModel> = async () => {
  return inject(HomeDataService).load();
};
