import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class MethodsService {
  http = inject(HttpClient);

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  getMethods(): any {
    return this.http.get(`${this.url}metodo`);
  }

  getMethod(id: number): any {
    return this.http.get(`${this.url}metodo/${id}`);
  }

  addMetodo(metodo: unknown): any {
    return this.http.post(`${this.url}metodo`, metodo);
  }

  updateMetodo(metodo: unknown): any {
    return this.http.put(`${this.url}metodo`, metodo);
  }

  deleteMetodo(id: number): any {
    return this.http.delete(`${this.url}metodo/${id}`);
  }

  uploadMetodoFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    return this.http.put(`${this.url}metodo/${id}/file`, formData);
  }
}
