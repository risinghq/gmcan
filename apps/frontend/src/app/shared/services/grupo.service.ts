import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class GrupoService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getGrupoInfo(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "grupo/get-grupo", { headers: headers });
    } else {
      return this.http.get(this.url + "grupo/get-grupo-en", { headers: headers });
    }
  }
  getGrupoImage(idGrupo: number, slot: "header" | "footer" | "facilidades") {
    return this.http.get(`${this.url}grupo/${idGrupo}/files/${slot}`, { responseType: "text" });
  }

  getFacilidadesRecursos(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "grupo/get-grupo-facilidades", { headers: headers });
  }

  updateRecursos(facilidades: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-facilidades", facilidades, {
      headers: headers,
    });
  }

  uploadFacilidadesFoto(fileData: File, id: number): any {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(`${this.url}grupo/${id}/files/facilidades`, formData, { headers });
  }

  getTrabajosFuturos(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "grupo/get-grupo-trabajosfuturos", { headers: headers });
  }

  updateTrabajosFuturos(trabajos: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-trabajosfuturos", trabajos, {
      headers: headers,
    });
  }

  uploadHeaderLogo(fileData: File, id: number): any {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(`${this.url}grupo/${id}/files/header`, formData, { headers });
  }

  uploadFooterLogo(fileData: File, id: number): any {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(`${this.url}grupo/${id}/files/footer`, formData, { headers });
  }

  updateSeccionInfo(grupo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-info", grupo, { headers: headers });
  }

  updateSeccionPresentacion(grupo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-seccionpresentacion", grupo, {
      headers: headers,
    });
  }

  updateSeccionPublicaciones(seccionpublicaciones: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-seccionpublicaciones", seccionpublicaciones, {
      headers: headers,
    });
  }

  updateSeccionProyectos(seccionproyectos: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "grupo/update-grupo-seccionproyectos", seccionproyectos, {
      headers: headers,
    });
  }
}
