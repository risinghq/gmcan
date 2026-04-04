import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class RevistaService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getRevistas(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "revista/get-revista", { headers: headers });
  }

  getRevista(idRevista: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "revista/get-revista/" + idRevista, { headers: headers });
  }

  addRevista(revista: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "revista/post-revista/", revista, { headers: headers });
  }

  updateRevista(revista: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "revista/update-revista/", revista, { headers: headers });
  }

  deleteRevista(idRevista: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "revista/delete-revista/" + idRevista, { headers: headers });
  }
}
