import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class MethodsService {
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

  getMethods(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "metodo/get-metodo", { headers: headers });
    } else {
      return this.http.get(this.url + "metodo/get-metodo-en", { headers: headers });
    }
  }

  getMethod(idNoticia: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "metodo/get-metodo/" + idNoticia, { headers: headers });
    } else {
      return this.http.get(this.url + "metodo/get-metodo-en/" + idNoticia, { headers: headers });
    }
  }

  addMetodo(metodo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "metodo/post-metodo/", metodo, { headers: headers });
  }

  updateMetodo(metodo: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "metodo/update-metodo/", metodo, { headers: headers });
  }

  deleteMetodo(idMetodo: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "metodo/delete-metodo/" + idMetodo, { headers: headers });
  }

  uploadMetodoFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(this.url + "metodo/upload-metodo-foto/" + id, formData, { headers });
  }
}
