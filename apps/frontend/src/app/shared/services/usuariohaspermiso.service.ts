import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class UsuarioHasPermisoService {
  REFRESH_TOKEN = "REFRESH_TOKEN";
  public url: string;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getUsuarioHasPermiso(DNI: string): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "usuariohaspermiso/get-usuariohaspermiso/" + DNI, {
      headers: headers,
    });
  }

  addPermisoUsuario(permisoUser: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "usuariohaspermiso/post-usuariohaspermiso/", permisoUser, {
      headers: headers,
    });
  }

  deletePermisoUsuario(permisoUser: { usuario_DNI: string }): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "usuariohaspermiso/delete-usuariohaspermiso/" + permisoUser.usuario_DNI, {
      headers: headers,
    });
  }
}
