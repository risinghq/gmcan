import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoMiembroService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getTipoMiembros(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipo-miembro/get-tipomiembro", { headers: headers });
    } else {
      return this.http.get(this.url + "tipo-miembro/get-tipomiembro-en", { headers: headers });
    }
  }

  getCountType(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "tipo-miembro/get-count-type", { headers: headers });
  }
}
