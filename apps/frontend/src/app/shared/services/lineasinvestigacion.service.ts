import { HttpClient, HttpHeaders } from "@angular/common/http";
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

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getLineasInvestigacion(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacion", {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacion-en", {
        headers: headers,
      });
    }
  }

  getLineasInvestigaciones(idLinea: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacions/" + idLinea, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacions-en/" + idLinea, {
        headers: headers,
      });
    }
  }

  getLineaInvestigacion(idLineasInvestigacion: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacion/" + idLineasInvestigacion, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "lineasinvestigacion/get-lineasinvestigacion-en/" + idLineasInvestigacion, {
        headers: headers,
      });
    }
  }

  addLinea(linea: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "lineasinvestigacion/post-lineasinvestigacion/", linea, {
      headers: headers,
    });
  }

  updateLinea(linea: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "lineasinvestigacion/update-lineasinvestigacion/", linea, {
      headers: headers,
    });
  }

  deleteLinea(idLinea: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "lineasinvestigacion/delete-lineasinvestigacion/" + idLinea, {
      headers: headers,
    });
  }

  uploadLineaFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(this.url + "lineasinvestigacion/upload-lineainvestigacion-foto/" + id, formData, { headers });
  }
}
