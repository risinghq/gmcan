import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class PublicacionHasAutorService {
  public url: string;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getPublicacionHasAutor(idPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "publicacion-autor/get-publicacionhasautor/" + idPublicacion, {
      headers: headers,
    });
  }

  searchPublicacionHasAutor(id): any {
    let body = { autores_idAutor: id };
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion-autor/search-publicacionhasautor", body, {
      headers: headers,
    });
  }

  addPublicacionHasAutor(autorPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion-autor/post-publicacionhasautor/", autorPublicacion, {
      headers: headers,
    });
  }

  deletePublicacionHasAutor(idAutorPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "publicacion-autor/delete-publicacionhasautor/" + idAutorPublicacion, {
      headers: headers,
    });
  }
}
