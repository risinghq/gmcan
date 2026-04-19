import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { SessionService } from "@app/shared/services/session.service";
import { Observable } from "rxjs";

import type { Noticia } from "../models/noticia";
import { GLOBAL } from "./global";

@Injectable({
  providedIn: "root",
})
export class NoticiaService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;

  private get lang(): string {
    return this._session.languageCode === "en" ? "en" : "es";
  }

  constructor() {
    this.url = GLOBAL.url;
  }

  getNoticias(): any {
    return this.http.get(`${this.url}noticia?lang=${this.lang}`);
  }

  getNoticia(id: number): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${this.url}noticia/${id}?lang=${this.lang}`);
  }

  getNoticiaByTipo(idTipo: number): any {
    return this.http.get(`${this.url}noticia?tipoId=${idTipo}&lang=${this.lang}`);
  }

  getNoticiaByUsuario(dni: string): any {
    return this.http.get(`${this.url}noticia?usuarioDni=${dni}&lang=${this.lang}`);
  }

  addNews(noticia: unknown): any {
    return this.http.post(`${this.url}noticia`, noticia);
  }

  updateNoticia(noticia: unknown): any {
    return this.http.put(`${this.url}noticia`, noticia);
  }

  deleteNoticia(id: number): any {
    return this.http.delete(`${this.url}noticia/${id}`);
  }

  uploadNoticiaFoto(fileData: File, id: number) {
    const formData = new FormData();
    formData.append("foto", fileData, fileData.name);
    return this.http.put(`${this.url}noticia/${id}/file`, formData);
  }

  getNoticiaFull(id: number): any {
    return this.http.get(`${this.url}noticia/${id}/full`);
  }
}
