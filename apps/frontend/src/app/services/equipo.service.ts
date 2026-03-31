import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class EquipoService {
  public url: string;
  JWT_TOKEN = "JWT_TOKEN";

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getEquipos(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "equipo/get-equipo", { headers: headers });
  }

  getEquipo(idEquipo): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "equipo/get-equipo/" + idEquipo, { headers: headers });
  }

  addEquipo(equipo): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.post(this.url + "equipo/post-equipo/", equipo, { headers: headers });
  }

  updateEquipo(equipo): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "equipo/update-equipo/", equipo, { headers: headers });
  }

  deleteEquipo(idEquipo): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.delete(this.url + "equipo/delete-equipo/" + idEquipo, { headers: headers });
  }
}
