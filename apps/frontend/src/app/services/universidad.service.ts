import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class UniversidadService {
  public url: string;
  JWT_TOKEN = "JWT_TOKEN";
  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getUniversidades(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "universidad/get-universidad", { headers: headers });
    } else {
      return this.http.get(this.url + "universidad/get-universidad-en", { headers: headers });
    }
  }

  getUniversidad(idUniversidad) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "universidad/get-universidad/" + idUniversidad, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "universidad/get-universidad-en/" + idUniversidad, {
        headers: headers,
      });
    }
  }

  addUniversidad(universidad): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.post(this.url + "universidad/post-universidad/", universidad, {
      headers: headers,
    });
  }

  updateUniversidad(universidad): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "universidad/update-universidad/", universidad, {
      headers: headers,
    });
  }

  deleteUniversidad(idUniversidad): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.delete(this.url + "universidad/delete-universidad/" + idUniversidad, {
      headers: headers,
    });
  }
}
