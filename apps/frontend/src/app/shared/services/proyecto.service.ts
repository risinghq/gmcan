import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class ProyectoService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getProyectos(): any {
    return this.http.get(`${this.url}proyecto?lang=${this.lang}`);
  }

  getProyectosByEstado(estado: number): any {
    return this.http.get(`${this.url}proyecto?estado=${estado}&lang=${this.lang}`);
  }

  getProyectosByLinea(idLinea: number, estado: number): any {
    return this.http.post(`${this.url}proyecto/search`, {
      lineasInvestigacion_idLineasInvestigacion: idLinea,
      estado,
    });
  }

  getProyectoById(id: number): any {
    return this.http.get(`${this.url}proyecto/${id}?lang=${this.lang}`);
  }

  getProyectoFuente(idFuente: number): any {
    return this.http.get(`${this.url}proyecto?fuenteId=${idFuente}`);
  }

  addProyecto(proyecto: unknown): any {
    return this.http.post(`${this.url}proyecto`, proyecto);
  }

  updateProyecto(proyecto: unknown): any {
    return this.http.put(`${this.url}proyecto`, proyecto);
  }

  deleteProyecto(id: number): any {
    return this.http.delete(`${this.url}proyecto/${id}`);
  }

  endProyecto(proyecto: unknown): any {
    return this.http.put(`${this.url}proyecto/${proyecto}/end`, {});
  }

  restartProyecto(proyecto: unknown): any {
    return this.http.put(`${this.url}proyecto/${proyecto}/restart`, {});
  }
}
