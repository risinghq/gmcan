import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AdminResearchLine, ResearchLineTranslation, Translations } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import type { ResearchLine } from "../models/research-line";
import { GLOBAL } from "./global";

export interface ResearchLineWrite {
  translations: Translations<ResearchLineTranslation>;
}

@Injectable({ providedIn: "root" })
export class ResearchLinesService {
  private http = inject(HttpClient);

  list(): Observable<ResearchLine[]> {
    return this.http.get<ResearchLine[]>(GLOBAL.api("research-lines"));
  }

  listAdmin(): Observable<AdminResearchLine[]> {
    return this.http.get<AdminResearchLine[]>(GLOBAL.admin("research-lines"));
  }

  get(id: number): Observable<AdminResearchLine> {
    return this.http.get<AdminResearchLine>(GLOBAL.admin(`research-lines/${id}`));
  }

  create(body: ResearchLineWrite & { groupId: number }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("research-lines"), body);
  }

  update(id: number, body: ResearchLineWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`research-lines/${id}`), body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`research-lines/${id}`));
  }
}
