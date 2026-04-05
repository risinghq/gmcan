import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { SaveAuthorEntry } from "../models/author";
import type { Publicacion } from "../models/publicacion";
import type { PublicacionEditView } from "../models/publicacion-edit-view";
import { GLOBAL } from "./global";
import { SessionService } from "./session.service";

interface PublicacionFields {
  titulo: string;
  resumen?: string;
  resumenEN?: string;
  DOI?: string;
  fechaPublicacion: string;
  nroRevista?: number;
  tipoPublicacion_idTipoPublicacion: number;
  revista_idRevista?: number;
  universidad_idUniversidad?: number;
  tipoTesis_idTipoTesis?: number;
  evento_idEvento?: number;
}

@Injectable({ providedIn: "root" })
export class PublicacionService {
  http = inject(HttpClient);
  private _session = inject(SessionService);

  private get languagelocal(): string {
    return this._session.getLanguageData<{ locale?: string }>()?.locale ?? "es";
  }

  getPublicacion(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/`);
  }

  getPublicaciones(idTipoPublicacion: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/by-tipo/${idTipoPublicacion}`);
  }

  getPublication(idPublicacion: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/${idPublicacion}`);
  }

  getPublicacionesEvento(idEvento: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/by-evento/${idEvento}`);
  }

  getPublicacionesUniversidad(idUniversidad: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/by-universidad/${idUniversidad}`);
  }

  getPublicacionesRevista(idRevista: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${GLOBAL.url}publicacion/by-revista/${idRevista}`);
  }

  getEditView(id: number): Observable<PublicacionEditView> {
    return this.http.get<PublicacionEditView>(`${GLOBAL.url}publicacion/${id}/edit-view`);
  }

  save(data: PublicacionFields, autores: SaveAuthorEntry[]): Observable<{ idPublicacion: number }> {
    return this.http.post<{ idPublicacion: number }>(`${GLOBAL.url}publicacion`, { data, autores });
  }

  update(id: number, data: PublicacionFields, autores: SaveAuthorEntry[]): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}publicacion/${id}`, { data, autores });
  }

  delete(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}publicacion/${id}`);
  }

  uploadFile(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}publicacion/${id}/file`, formData);
  }

  uploadPublicacionFile(fileData: File, id: number): Observable<{ status: number }> {
    return this.uploadFile(id, fileData);
  }

  downloadPublicacion(idPublicacion: number): Observable<Blob> {
    return this.http.get(`${GLOBAL.url}publicacion/${idPublicacion}/file/download`, { responseType: "blob" });
  }
}
