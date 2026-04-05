import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { Revista } from "../models/revista";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AdminRevistaService {
  private http = inject(HttpClient);

  addRevista(revista: Revista): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}revista/post-revista/`, revista);
  }

  updateRevista(revista: Revista): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}revista/update-revista/`, revista);
  }

  deleteRevista(idRevista: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}revista/delete-revista/${idRevista}`);
  }
}
