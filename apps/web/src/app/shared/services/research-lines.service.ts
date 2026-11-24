import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { ResearchLine } from "../models/research-line";
import { GLOBAL } from "./global";

export interface ResearchLineBody {
  name: string;
  description?: string;
  groupId: number;
}

export interface ResearchLineUpdateBody {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class ResearchLinesService {
  private http = inject(HttpClient);

  list(): Observable<ResearchLine[]> {
    return this.http.get<ResearchLine[]>(GLOBAL.api("research-lines"));
  }

  listAdmin(): Observable<ResearchLine[]> {
    return this.http.get<ResearchLine[]>(GLOBAL.admin("research-lines"));
  }

  get(id: number): Observable<ResearchLine> {
    return this.http.get<ResearchLine>(GLOBAL.admin(`research-lines/${id}`));
  }

  create(body: ResearchLineBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("research-lines"), body);
  }

  update(id: number, body: ResearchLineUpdateBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`research-lines/${id}`), body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`research-lines/${id}`));
  }
}
