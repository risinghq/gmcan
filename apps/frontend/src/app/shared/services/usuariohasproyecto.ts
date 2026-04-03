import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class UsuarioHasProyectoService {
  public url: string;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getUsuarioHasProyectos(idProyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "usuariohasproyecto/get-usuariohasproyecto/" + idProyecto, {
      headers: headers,
    });
  }

  getUsuarioHasProyecto(dni): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "usuariohasproyecto/get-usuariohasproyectos/" + dni, {
      headers: headers,
    });
  }

  addUsuarioProyecto(proyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "usuariohasproyecto/post-usuariohasproyecto/", proyecto, {
      headers: headers,
    });
  }

  deleteUsuarioProyecto(idProyecto): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "usuariohasproyecto/delete-usuariohasproyecto/" + idProyecto, {
      headers: headers,
    });
  }
}
