import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class MonedaService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getMonedas(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "moneda/get-moneda", { headers: headers });
  }

  getMoneda(idMoneda: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "moneda/get-moneda/" + idMoneda, { headers: headers });
  }
}
