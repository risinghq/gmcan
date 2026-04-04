import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoMiembroService {
  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor(
    public http: HttpClient,
    private _session: SessionService,
  ) {
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
