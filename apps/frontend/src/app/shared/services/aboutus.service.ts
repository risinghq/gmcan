import { HttpClient } from "@angular/common/http";
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

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getAboutUsInfo(): any {
    return this.http.get(`${this.url}sobrenosotros?lang=${this.lang}`);
  }

  updateDescripcion(sobrenosotros: unknown): any {
    return this.http.put(`${this.url}sobrenosotros/descripcion`, sobrenosotros);
  }

  updateObjetivos(sobrenosotros: unknown): any {
    return this.http.put(`${this.url}sobrenosotros/objetivos`, sobrenosotros);
  }

  updateServicios(sobrenosotros: unknown): any {
    return this.http.put(`${this.url}sobrenosotros/servicios`, sobrenosotros);
  }

  uploadGrupoFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    return this.http.put(`${this.url}sobrenosotros/${id}/file`, formData);
  }
}
