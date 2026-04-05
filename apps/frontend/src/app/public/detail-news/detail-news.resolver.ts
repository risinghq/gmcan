import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import { DetailNewsDataService } from "./detail-news-data.service";
import type { DetailNewsViewModel } from "./detail-news-data.types";

export const detailNewsResolver: ResolveFn<DetailNewsViewModel> = async (route: ActivatedRouteSnapshot) => {
  const idNoticia = Number(route.params["id"]);
  return inject(DetailNewsDataService).load(idNoticia);
};
