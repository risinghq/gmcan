import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoMiembroService {
  public url: string;

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getTipoMiembros(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipo-miembro/get-tipomiembro", { headers: headers });
    } else {
      return this.http.get(this.url + "tipo-miembro/get-tipomiembro-en", { headers: headers });
    }
  }

  getCountType(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "tipo-miembro/get-count-type", { headers: headers });
  }
}
