import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { Software } from "../models/software";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class SoftwareService {
  private http = inject(HttpClient);

  list(): Observable<Software[]> {
    return this.http.get<Software[]>(`${GLOBAL.url}api/software`);
  }
}
