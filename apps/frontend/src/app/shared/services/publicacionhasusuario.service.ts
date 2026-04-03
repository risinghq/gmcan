import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class PublicacionHasUsuarioService {
  public url: string;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getPublicacionHasUsuario(idPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "publicacion-usuario/get-publicacionhasusuario/" + idPublicacion, {
      headers: headers,
    });
  }

  searchPublicacionHasUsuario(DNI): any {
    let body = { usuario_DNI: DNI };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion-usuario/search-publicacionhasusuario", body, {
      headers: headers,
    });
  }

  addPublicacionHasUsuario(autorPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion-usuario/post-publicacionhasusuario/", autorPublicacion, {
      headers: headers,
    });
  }

  deletePublicacionHasUsuario(idAutorPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "publicacion-usuario/delete-publicacionhasusuario/" + idAutorPublicacion, {
      headers: headers,
    });
  }
}
