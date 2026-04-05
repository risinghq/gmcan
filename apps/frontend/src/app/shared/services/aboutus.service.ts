import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class AboutUsService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getAboutUsInfo(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "sobrenosotros/get-sobrenosotros", { headers: headers });
    } else {
      return this.http.get(this.url + "sobrenosotros/get-sobrenosotros-en", { headers: headers });
    }
  }

  updateDescripcion(sobrenosotros: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "sobrenosotros/update-descripciongrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  updateObjetivos(sobrenosotros: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "sobrenosotros/update-objetivosgrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  updateServicios(sobrenosotros: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "sobrenosotros/update-serviciosgrupo/", sobrenosotros, {
      headers: headers,
    });
  }

  uploadGrupoFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    let headers = new HttpHeaders({});
    return this.http.put(`${this.url}sobrenosotros/${id}/file`, formData, {
      headers,
    });
  }
}
