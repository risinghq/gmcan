import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { SearchResults } from "../models/search-results";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class SearchService {
  private http = inject(HttpClient);

  search(query: string, types?: ("publications" | "members" | "news" | "projects")[]): Observable<SearchResults> {
    const params: Record<string, string> = { q: query };
    if (types && types.length > 0) {
      params["types"] = types.join(",");
    }
    return this.http.get<SearchResults>(`${GLOBAL.url}search`, { params });
  }
}
