import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AdminMethod, MethodTranslation, Translations } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import type { Method } from "../models/method";
import { GLOBAL } from "./global";

export interface MethodWrite {
  translations: Translations<MethodTranslation>;
}

@Injectable({ providedIn: "root" })
export class MethodsService {
  private http = inject(HttpClient);

  list(): Observable<Method[]> {
    return this.http.get<Method[]>(GLOBAL.api("methods"));
  }

  listAdmin(): Observable<AdminMethod[]> {
    return this.http.get<AdminMethod[]>(GLOBAL.admin("methods"));
  }

  get(id: number): Observable<AdminMethod> {
    return this.http.get<AdminMethod>(GLOBAL.admin(`methods/${id}`));
  }

  create(body: MethodWrite & { groupId: number }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("methods"), body);
  }

  update(id: number, body: MethodWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`methods/${id}`), body);
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`methods/${id}`));
  }
}
