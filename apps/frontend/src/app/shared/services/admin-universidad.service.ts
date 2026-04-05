import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { Universidad } from "../models/universidad";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AdminUniversidadService {
  private http = inject(HttpClient);

  addUniversidad(universidad: Universidad): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}universidad/post-universidad/`, universidad);
  }

  updateUniversidad(universidad: Universidad): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}universidad/update-universidad/`, universidad);
  }

  deleteUniversidad(idUniversidad: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}universidad/delete-universidad/${idUniversidad}`);
  }
}
