import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AuthorOption, PublicationAuthor, SaveAuthorEntry } from "@app/shared/models/author";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class PublicacionAutoresService {
  private http = inject(HttpClient);

  private readonly base = GLOBAL.url + "publicacion-autores";

  /** Autocomplete pool: registered users + past external author names */
  search(q = ""): Observable<AuthorOption[]> {
    return this.http.get<AuthorOption[]>(`${this.base}/search`, { params: { q } });
  }

  /** All credited authors for a publication, ordered by isPrincipal */
  getForPublication(id: number): Observable<PublicationAuthor[]> {
    return this.http.get<PublicationAuthor[]>(`${this.base}/${id}`);
  }

  /** Atomically replace all authors for a publication */
  saveForPublication(id: number, authors: SaveAuthorEntry[]): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${this.base}/${id}`, authors);
  }

  /** Publication IDs where a registered user is credited */
  getByUser(dni: string): Observable<{ publicacion_idPublicacion: number }[]> {
    return this.http.get<{ publicacion_idPublicacion: number }[]>(`${this.base}/by-user/${encodeURIComponent(dni)}`);
  }

  /** Publication IDs credited to any author matching the query (for search pages) */
  searchPublications(q: string): Observable<{ publicacion_idPublicacion: number }[]> {
    return this.http.get<{ publicacion_idPublicacion: number }[]>(`${this.base}/search-publications`, {
      params: { q },
    });
  }
}
