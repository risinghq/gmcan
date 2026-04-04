import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class TipoNoticiaService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;
  REFRESH_TOKEN = "REFRESH_TOKEN";

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getTipoNoticia(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipo-noticia/get-tiponoticia", { headers: headers });
    } else {
      return this.http.get(this.url + "tipo-noticia/get-tiponoticia-en", { headers: headers });
    }
  }

  getTipoNews(idTipoNoticia: number) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "tipo-noticia/get-tiponoticia/" + idTipoNoticia, {
        headers: headers,
      });
    } else {
      return this.http.get(this.url + "tipo-noticia/get-tiponoticia-en/" + idTipoNoticia, {
        headers: headers,
      });
    }
  }

  addCategory(category: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "tipo-noticia/post-tiponoticia", category, { headers });
  }

  updateCategory(category: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "tipo-noticia/update-tiponoticia", category, { headers });
  }

  deleteCategory(idCategory: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "tipo-noticia/delete-tiponoticia/" + idCategory, {
      headers,
    });
  }
}
