import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class SoftwareService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get languagelocal(): string {
    return this._session.languageCode ?? "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getSoftware(): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    if (this.languagelocal == "es") {
      return this.http.get(this.url + "software/get-software", { headers: headers });
    } else {
      return this.http.get(this.url + "software/get-software-en", { headers: headers });
    }
  }

  getSoftwareId(idSoftware: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.get(this.url + "software/get-software/" + idSoftware, { headers: headers });
  }

  addSoftware(software: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(this.url + "software/post-software/", software, { headers: headers });
  }

  updateSoftware(software: unknown): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.put(this.url + "software/update-software/", software, { headers: headers });
  }

  deleteSoftware(idSoftware: number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.delete(this.url + "software/delete-software/" + idSoftware, {
      headers: headers,
    });
  }
}
