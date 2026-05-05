import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { HomeDataService } from "./data";
import type { HomeViewModel } from "./types";

export const homeResolver: ResolveFn<HomeViewModel> = async () => {
  return inject(HomeDataService).load();
};
