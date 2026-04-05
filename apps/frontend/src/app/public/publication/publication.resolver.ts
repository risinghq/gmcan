import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { PublicationDataService } from "./publication-data.service";
import type { PublicationViewModel } from "./publication-data.types";

export const publicationResolver: ResolveFn<PublicationViewModel> = async () => {
  return inject(PublicationDataService).load();
};
