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

  // Public
  list(): Observable<ResearchLine[]> {
    return this.http.get<ResearchLine[]>(`${GLOBAL.url}api/research-lines`);
  }

  // Admin
  listAdmin(): Observable<ResearchLine[]> {
    return this.http.get<ResearchLine[]>(`${GLOBAL.url}admin/research-lines`);
  }

  get(id: number): Observable<ResearchLine> {
    return this.http.get<ResearchLine>(`${GLOBAL.url}admin/research-lines/${id}`);
  }

  create(body: ResearchLineBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/research-lines`, body);
  }

  update(id: number, body: ResearchLineUpdateBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/research-lines/${id}`, body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/research-lines/${id}`);
  }

  uploadAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/research-lines/${id}/asset`, formData);
  }
}
