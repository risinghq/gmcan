import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class EquipoService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getEquipos(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "equipo/get-equipo", { headers: headers });
  }

  getEquipo(idEquipo: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "equipo/get-equipo/" + idEquipo, { headers: headers });
  }

  addEquipo(equipo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "equipo/post-equipo/", equipo, { headers: headers });
  }

  updateEquipo(equipo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "equipo/update-equipo/", equipo, { headers: headers });
  }

  deleteEquipo(idEquipo: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "equipo/delete-equipo/" + idEquipo, { headers: headers });
  }
}
