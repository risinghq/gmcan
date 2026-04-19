import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class LineasInvestigacionService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getLineasInvestigacion(): any {
    return this.http.get(`${this.url}lineasinvestigacion?lang=${this.lang}`);
  }

  getLineasInvestigacionByLinea(idLinea: number): any {
    return this.http.get(`${this.url}lineasinvestigacion?parentId=${idLinea}&lang=${this.lang}`);
  }

  getLineaInvestigacion(id: number): any {
    return this.http.get(`${this.url}lineasinvestigacion/${id}?lang=${this.lang}`);
  }

  addLinea(linea: unknown): any {
    return this.http.post(`${this.url}lineasinvestigacion`, linea);
  }

  updateLinea(linea: unknown): any {
    return this.http.put(`${this.url}lineasinvestigacion`, linea);
  }

  deleteLinea(id: number): any {
    return this.http.delete(`${this.url}lineasinvestigacion/${id}`);
  }

  uploadLineaFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    return this.http.put(`${this.url}lineasinvestigacion/${id}/file`, formData);
  }
}
