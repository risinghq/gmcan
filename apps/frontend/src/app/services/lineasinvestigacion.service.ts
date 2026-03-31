import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class LineasInvestigacionService {
  public url: string;
  JWT_TOKEN = "JWT_TOKEN";

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
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

  getLineasInvestigaciones(idLinea): any {
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

  getLineaInvestigacion(idLineasInvestigacion): any {
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

  addLinea(linea): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.post(this.url + "lineasinvestigacion/post-lineasinvestigacion/", linea, {
      headers: headers,
    });
  }

  updateLinea(linea): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "lineasinvestigacion/update-lineasinvestigacion/", linea, {
      headers: headers,
    });
  }

  deleteLinea(idLinea): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.delete(this.url + "lineasinvestigacion/delete-lineasinvestigacion/" + idLinea, {
      headers: headers,
    });
  }

  uploadLineaFoto(fileData, id) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "lineasinvestigacion/upload-lineainvestigacion-foto/" + id, formData, { headers });
  }
}
