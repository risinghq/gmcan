import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import { DetailNewsDataService } from "./data";
import type { DetailNewsViewModel } from "./types";

export const detailNewsResolver: ResolveFn<DetailNewsViewModel> = async (route: ActivatedRouteSnapshot) => {
  const idNoticia = Number(route.params["id"]);
  return inject(DetailNewsDataService).load(idNoticia);
};
