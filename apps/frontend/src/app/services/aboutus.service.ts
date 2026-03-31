import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class AboutUsService {
  public url: string;
  JWT_TOKEN = "JWT_TOKEN";

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getAboutUsInfo(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "sobrenosotros/get-sobrenosotros", { headers: headers });
    } else {
      return this.http.get(this.url + "sobrenosotros/get-sobrenosotros-en", { headers: headers });
    }
  }

  updateDescripcion(sobrenosotros): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "sobrenosotros/update-descripciongrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  updateObjetivos(sobrenosotros): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "sobrenosotros/update-objetivosgrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  updateServicios(sobrenosotros): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "sobrenosotros/update-serviciosgrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  uploadGrupoFoto(fileData, id) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "sobrenosotros/upload-sobrenosotros-foto/" + id, formData, {
      headers,
    });
  }
}
