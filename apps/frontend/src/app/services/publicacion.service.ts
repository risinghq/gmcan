import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class PublicacionService {
  public url: string;
  JWT_TOKEN = "JWT_TOKEN";

  languagelocal;
  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
    this.languagelocal = JSON.parse(localStorage.getItem("language")).locale;
  }

  getPublicacion(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacion", { headers: headers });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacion-en", { headers: headers });
    }
  }

  getPublicaciones(idTipoPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicaciones/" + idTipoPublicacion, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicaciones-en/" + idTipoPublicacion, {
        headers: headers,
      });
    }
  }

  getPublication(idPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacion/" + idPublicacion, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacion-en/" + idPublicacion, {
        headers: headers,
      });
    }
  }

  getPublicacionesCiudad(idCiudad): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacionesciudad/" + idCiudad, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacionesciudad-en/" + idCiudad, {
        headers: headers,
      });
    }
  }

  getPublicacionesEvento(idEvento): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacionesevento/" + idEvento, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacionesevento-en/" + idEvento, {
        headers: headers,
      });
    }
  }

  getPublicacionesUniversidad(idUniversidad): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacionesuniversidad/" + idUniversidad, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacionesuniversidad-en/" + idUniversidad, {
        headers: headers,
      });
    }
  }

  getPublicacionesRevista(idRevista): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "publicacion/get-publicacionesrevista/" + idRevista, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "publicacion/get-publicacionesrevista-en/" + idRevista, {
        headers: headers,
      });
    }
  }

  addPublicacion(publicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.post(this.url + "publicacion/post-publicacion/", publicacion, {
      headers: headers,
    });
  }

  updatePublicacion(publicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "publicacion/update-publicacion/", publicacion, {
      headers: headers,
    });
  }

  deletePublicacion(idPublicacion): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.delete(this.url + "publicacion/delete-publicacion/" + idPublicacion, {
      headers: headers,
    });
  }

  uploadPublicacionFile(fileData, id) {
    const formData = new FormData();
    formData.append("file", fileData, fileData.name);
    let headers = new HttpHeaders({
      Authorization: "Bearer " + localStorage.getItem(this.JWT_TOKEN),
    });
    return this.http.put(this.url + "publicacion/upload-publicacion-file/" + id, formData, {
      headers: headers,
    });
  }
}
