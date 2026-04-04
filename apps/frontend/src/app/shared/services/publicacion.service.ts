import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class PublicacionService {
  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor(
    public http: HttpClient,
    private _session: SessionService,
  ) {
    this.url = GLOBAL.url;
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

  getPublicaciones(idTipoPublicacion: number): any {
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

  getPublication(idPublicacion: number): any {
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

  getPublicacionesCiudad(idCiudad: number): any {
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

  getPublicacionesEvento(idEvento: number): any {
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

  getPublicacionesUniversidad(idUniversidad: number): any {
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

  getPublicacionesRevista(idRevista: number): any {
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

  addPublicacion(publicacion: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "publicacion/post-publicacion/", publicacion, {
      headers: headers,
    });
  }

  updatePublicacion(publicacion: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "publicacion/update-publicacion/", publicacion, {
      headers: headers,
    });
  }

  deletePublicacion(idPublicacion: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "publicacion/delete-publicacion/" + idPublicacion, {
      headers: headers,
    });
  }

  uploadPublicacionFile(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("file", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(this.url + "publicacion/upload-publicacion-file/" + id, formData, {
      headers: headers,
    });
  }
}
