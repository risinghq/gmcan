import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoTesisService {
  public url: string;

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getTiposTesis(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipotesis/get-tipotesis", { headers: headers });
    } else {
      return this.http.get(this.url + "tipotesis/get-tipotesis-en", { headers: headers });
    }
  }

  getTipoTesis(idTipoTesis) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipotesis/get-tipotesis/" + idTipoTesis, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "tipotesis/get-tipotesis-en/" + idTipoTesis, {
        headers: headers,
      });
    }
  }
}
