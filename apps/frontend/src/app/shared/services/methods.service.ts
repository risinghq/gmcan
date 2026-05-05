import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { Method } from "../models/method";
import { GLOBAL } from "./global";

export interface MethodBody {
  name: string;
  description: string;
  groupId: number;
}

export interface MethodUpdateBody {
  name: string;
  description: string;
}

@Injectable({ providedIn: "root" })
export class MethodsService {
  private http = inject(HttpClient);

  // Public
  list(): Observable<Method[]> {
    return this.http.get<Method[]>(`${GLOBAL.url}api/methods`);
  }

  // Admin
  listAdmin(): Observable<Method[]> {
    return this.http.get<Method[]>(`${GLOBAL.url}admin/methods`);
  }

  get(id: number): Observable<Method> {
    return this.http.get<Method>(`${GLOBAL.url}admin/methods/${id}`);
  }

  create(body: MethodBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/methods`, body);
  }

  update(id: number, body: MethodUpdateBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/methods/${id}`, body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/methods/${id}`);
  }

  uploadAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/methods/${id}/asset`, formData);
  }
}
