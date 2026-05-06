import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface DashboardCountItem {
  code: string;
  label: string;
  count: number;
}

export interface DashboardSummary {
  membersByType: DashboardCountItem[];
  publicationsByKind: DashboardCountItem[];
}

@Injectable({ providedIn: "root" })
export class DashboardService {
  private http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(GLOBAL.admin("dashboard/summary"));
  }
}
