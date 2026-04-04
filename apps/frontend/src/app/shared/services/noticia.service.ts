import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class NoticiaService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getNoticias(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "noticia/get-noticia", { headers: headers });
    } else {
      return this.http.get(this.url + "noticia/get-noticia-en", { headers: headers });
    }
  }

  getNoticia(idNoticia: number) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "noticia/get-noticia/" + idNoticia, { headers: headers });
    } else {
      return this.http.get(this.url + "noticia/get-noticia-en/" + idNoticia, { headers: headers });
    }
  }

  getNoticiaTipo(idTipo: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "noticia/get-noticiatipo/" + idTipo, { headers: headers });
    } else {
      return this.http.get(this.url + "noticia/get-noticiatipo-en/" + idTipo, { headers: headers });
    }
  }

  getNoticiaUsuario(idUsuario: string): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "noticia/get-noticiausuario/" + idUsuario, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "noticia/get-noticiausuario-en/" + idUsuario, {
        headers: headers,
      });
    }
  }

  addNews(noticia: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "noticia/post-noticia", noticia, { headers });
  }

  uploadNoticiaFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(this.url + "noticia/upload-noticia-file/" + id, formData, { headers });
  }

  getNoticiaFull(idNoticia: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "noticia/get-noticiafull/" + idNoticia, { headers: headers });
  }

  updateNoticia(noticia: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "noticia/update-noticia", noticia, { headers });
  }

  deleteNoticia(idNoticia: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "noticia/delete-noticia/" + idNoticia, { headers });
  }
}
