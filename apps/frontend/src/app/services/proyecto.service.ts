import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class ProyectoService {
  public url: string;

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
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

  getProyectos(estado): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "proyecto/get-proyectos/" + estado, { headers: headers });
    } else {
      return this.http.get(this.url + "proyecto/get-proyectos-en/" + estado, { headers: headers });
    }
  }

  getProyectosLinea(idLinea, estado): any {
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

  getProyectosId(idProyecto, estado): any {
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

  getProject(idProyecto): any {
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

  getProyectoFuente(idFuente): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "proyecto/get-proyectofuente/" + idFuente, { headers });
  }

  addProyecto(proyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "proyecto/post-proyecto/", proyecto, { headers: headers });
  }

  updateProyecto(proyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/update-proyecto/", proyecto, { headers: headers });
  }

  deleteProyecto(idProyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "proyecto/delete-proyecto/" + idProyecto, {
      headers: headers,
    });
  }

  endProyecto(proyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/end-proyecto/", proyecto, { headers: headers });
  }

  restartProyecto(proyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "proyecto/restart-proyecto/", proyecto, { headers: headers });
  }
}
