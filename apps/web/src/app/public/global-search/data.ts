import { Injectable, inject } from "@angular/core";
import { SearchService } from "@app/shared/services/search.service";
import { firstValueFrom } from "rxjs";

import type { GlobalSearchViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class GlobalSearchDataService {
  private readonly searchService = inject(SearchService);

  async load(searchId: string): Promise<GlobalSearchViewModel> {
    return firstValueFrom(this.searchService.search(searchId));
  }
}
