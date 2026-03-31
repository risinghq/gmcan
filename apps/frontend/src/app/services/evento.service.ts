import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class EventoService {
  public url: string;
  languagelocal;
  JWT_TOKEN = "JWT_TOKEN";

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getEventoesAll(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "evento/get-evento", { headers: headers });
    } else {
      return this.http.get(this.url + "evento/get-evento-en", { headers: headers });
    }
  }

  getEvento(idEvento): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "evento/get-evento/" + idEvento, { headers: headers });
    } else {
      return this.http.get(this.url + "evento/get-evento-en/" + idEvento, { headers: headers });
    }
  }

  addEvento(evento): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.post(this.url + "evento/post-evento/", evento, { headers: headers });
  }

  updateEvento(evento): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "evento/update-evento/", evento, { headers: headers });
  }

  deleteEvento(idEvento): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.delete(this.url + "evento/delete-evento/" + idEvento, { headers: headers });
  }

  getCiudades(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.get(this.url + "evento/get-ciudad/", { headers: headers });
  }

  getCiudadesEN(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.get(this.url + "evento/get-ciudad-en/", { headers: headers });
  }

  getPais(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.get(this.url + "evento/get-pais/", { headers: headers });
  }

  getPaisEN(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.get(this.url + "evento/get-pais-en/", { headers: headers });
  }
}
