import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { GlobalSearchResults } from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class SearchService {
  private http = inject(HttpClient);

  search(query: string, types?: ("publications" | "members" | "news" | "projects")[]): Observable<GlobalSearchResults> {
    const params: Record<string, string> = { q: query };
    if (types && types.length > 0) {
      params["types"] = types.join(",");
    }
    return this.http.get<GlobalSearchResults>(GLOBAL.api("search"), { params });
  }
}
