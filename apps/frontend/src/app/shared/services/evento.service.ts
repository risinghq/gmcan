import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class EventoService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getEventos(): any {
    return this.http.get(`${this.url}evento?lang=${this.lang}`);
  }

  getEvento(id: number): any {
    return this.http.get(`${this.url}evento/${id}?lang=${this.lang}`);
  }

  addEvento(evento: unknown): any {
    return this.http.post(`${this.url}evento`, evento);
  }

  updateEvento(evento: unknown): any {
    return this.http.put(`${this.url}evento`, evento);
  }

  deleteEvento(id: number): any {
    return this.http.delete(`${this.url}evento/${id}`);
  }

  getCiudades(): any {
    return this.http.get(`${this.url}evento/ciudades?lang=${this.lang}`);
  }

  getPais(): any {
    return this.http.get(`${this.url}evento/paises?lang=${this.lang}`);
  }
}
