import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class ProyectoService {
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

  getProyecto(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "proyecto/get-proyecto", { headers: headers });
    } else {
      return this.http.get(this.url + "proyecto/get-proyecto-en", { headers: headers });
    }
  }

  getProyectos(estado: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "proyecto/get-proyectos/" + estado, { headers: headers });
    } else {
      return this.http.get(this.url + "proyecto/get-proyectos-en/" + estado, { headers: headers });
    }
  }

  getProyectosLinea(idLinea: number, estado: number): any {
    let body = { lineasInvestigacion_idLineasInvestigacion: idLinea, estado: estado };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "proyecto/get-proyectolinea", body, { headers });
    } else {
      return this.http.post(this.url + "proyecto/get-proyectolinea-en", body, { headers });
    }
  }

  getProyectosId(idProyecto: number, estado: number): any {
    let body = { idProyecto: idProyecto, estado: estado };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.post(this.url + "proyecto/get-proyectoid", body, { headers });
    } else {
      return this.http.post(this.url + "proyecto/get-proyectoid-en", body, { headers });
    }
  }

  getProject(idProyecto: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "proyecto/get-proyecto/" + idProyecto, { headers: headers });
    } else {
      return this.http.get(this.url + "proyecto/get-proyecto-en/" + idProyecto, {
        headers: headers,
      });
    }
  }

  getProyectoFuente(idFuente: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "proyecto/get-proyectofuente/" + idFuente, { headers });
  }

  addProyecto(proyecto: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "proyecto/post-proyecto/", proyecto, { headers: headers });
  }

  updateProyecto(proyecto: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/update-proyecto/", proyecto, { headers: headers });
  }

  deleteProyecto(idProyecto: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "proyecto/delete-proyecto/" + idProyecto, {
      headers: headers,
    });
  }

  endProyecto(proyecto: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/end-proyecto/", proyecto, { headers: headers });
  }

  restartProyecto(proyecto: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/restart-proyecto/", proyecto, { headers: headers });
  }
}
