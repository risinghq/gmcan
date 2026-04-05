import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";

import { PublicationDataService } from "./data";
import type { PublicationViewModel } from "./types";

export const publicationResolver: ResolveFn<PublicationViewModel> = async () => {
  return inject(PublicationDataService).load();
};
