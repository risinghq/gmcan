import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class UsuarioHasProyectoService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getUsuarioHasProyectos(idProyecto: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "usuariohasproyecto/get-usuariohasproyecto/" + idProyecto, {
      headers: headers,
    });
  }

  getUsuarioHasProyecto(dni: string): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "usuariohasproyecto/get-usuariohasproyectos/" + dni, {
      headers: headers,
    });
  }

  addUsuarioProyecto(proyecto: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "usuariohasproyecto/post-usuariohasproyecto/", proyecto, {
      headers: headers,
    });
  }

  deleteUsuarioProyecto(idProyecto: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "usuariohasproyecto/delete-usuariohasproyecto/" + idProyecto, {
      headers: headers,
    });
  }
}
