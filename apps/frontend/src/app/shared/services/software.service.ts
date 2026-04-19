import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class SoftwareService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getSoftware(): any {
    return this.http.get(`${this.url}software?lang=${this.lang}`);
  }

  getSoftwareId(id: number): any {
    return this.http.get(`${this.url}software/${id}?lang=${this.lang}`);
  }

  addSoftware(software: unknown): any {
    return this.http.post(`${this.url}software`, software);
  }

  updateSoftware(software: unknown): any {
    return this.http.put(`${this.url}software`, software);
  }

  deleteSoftware(id: number): any {
    return this.http.delete(`${this.url}software/${id}`);
  }
}
