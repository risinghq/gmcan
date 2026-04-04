import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class FuenteFinanciamientoService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getFuenteFinanciamientos(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "fuentefinanciamiento/get-fuentefinanciamiento", {
      headers: headers,
    });
  }

  getFuenteFinanciamiento(idFuente: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "fuentefinanciamiento/get-fuentefinanciamiento/" + idFuente, {
      headers: headers,
    });
  }

  addFuenteFinanciamiento(fuenteFinanciamiento: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "fuentefinanciamiento/post-fuentefinanciamiento/", fuenteFinanciamiento, {
      headers: headers,
    });
  }

  updateFuenteFinanciamiento(fuenteFinanciamiento: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "fuentefinanciamiento/update-fuentefinanciamiento/", fuenteFinanciamiento, {
      headers: headers,
    });
  }

  deleteFuenteFinanciamiento(idFuente: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "fuentefinanciamiento/delete-fuentefinanciamiento/" + idFuente, {
      headers: headers,
    });
  }
}
