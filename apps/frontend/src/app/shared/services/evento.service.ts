import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class EventoService {
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

  getEventoesAll(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "evento/get-evento", { headers: headers });
    } else {
      return this.http.get(this.url + "evento/get-evento-en", { headers: headers });
    }
  }

  getEvento(idEvento: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "evento/get-evento/" + idEvento, { headers: headers });
    } else {
      return this.http.get(this.url + "evento/get-evento-en/" + idEvento, { headers: headers });
    }
  }

  addEvento(evento: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "evento/post-evento/", evento, { headers: headers });
  }

  updateEvento(evento: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "evento/update-evento/", evento, { headers: headers });
  }

  deleteEvento(idEvento: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "evento/delete-evento/" + idEvento, { headers: headers });
  }

  getCiudades(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "evento/get-ciudad/", { headers: headers });
  }

  getCiudadesEN(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "evento/get-ciudad-en/", { headers: headers });
  }

  getPais(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "evento/get-pais/", { headers: headers });
  }

  getPaisEN(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "evento/get-pais-en/", { headers: headers });
  }
}
