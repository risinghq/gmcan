import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class GeneroService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getGeneros(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "genero/get-genero", { headers: headers });
  }
}
