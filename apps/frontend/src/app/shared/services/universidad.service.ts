import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class UniversidadService {
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

  getUniversidades(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "universidad/get-universidad", { headers: headers });
    } else {
      return this.http.get(this.url + "universidad/get-universidad-en", { headers: headers });
    }
  }

  getUniversidad(idUniversidad: number) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "universidad/get-universidad/" + idUniversidad, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "universidad/get-universidad-en/" + idUniversidad, {
        headers: headers,
      });
    }
  }

  addUniversidad(universidad: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "universidad/post-universidad/", universidad, {
      headers: headers,
    });
  }

  updateUniversidad(universidad: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "universidad/update-universidad/", universidad, {
      headers: headers,
    });
  }

  deleteUniversidad(idUniversidad: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "universidad/delete-universidad/" + idUniversidad, {
      headers: headers,
    });
  }
}
