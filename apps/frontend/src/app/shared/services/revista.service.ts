import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class RevistaService {
  public url: string;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }

  getRevistas(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "revista/get-revista", { headers: headers });
  }

  getRevista(idRevista): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "revista/get-revista/" + idRevista, { headers: headers });
  }

  addRevista(revista): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "revista/post-revista/", revista, { headers: headers });
  }

  updateRevista(revista): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "revista/update-revista/", revista, { headers: headers });
  }

  deleteRevista(idRevista): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "revista/delete-revista/" + idRevista, { headers: headers });
  }
}
