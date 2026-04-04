import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoTesisService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getTiposTesis(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipotesis/get-tipotesis", { headers: headers });
    } else {
      return this.http.get(this.url + "tipotesis/get-tipotesis-en", { headers: headers });
    }
  }

  getTipoTesis(idTipoTesis: number) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipotesis/get-tipotesis/" + idTipoTesis, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "tipotesis/get-tipotesis-en/" + idTipoTesis, {
        headers: headers,
      });
    }
  }
}
