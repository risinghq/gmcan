import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { SaveAuthorEntry } from "../models/author";
import type { Publication, PublicationWithAuthors } from "../models/publication";
import { GLOBAL } from "./global";

export interface PublicationFields {
  title: string;
  abstractES?: string;
  abstractEN?: string;
  doi?: string;
  publishedAt: string;
  journalIssue?: number;
  typeId: number;
  journalId?: number;
  universityId?: number;
  thesisTypeId?: number;
  eventId?: number;
}

export interface PublicationFilters {
  type?: number;
  event?: number;
  journal?: number;
  university?: number;
}

@Injectable({ providedIn: "root" })
export class PublicationService {
  private http = inject(HttpClient);

  // Public
  listPublications(filters?: PublicationFilters): Observable<PublicationWithAuthors[]> {
    return this.http.get<PublicationWithAuthors[]>(`${GLOBAL.url}api/publications`, {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  getPublication(id: number): Observable<PublicationWithAuthors> {
    return this.http.get<PublicationWithAuthors>(`${GLOBAL.url}api/publications/${id}`);
  }

  getFile(id: number): Observable<Blob> {
    return this.http.get(`${GLOBAL.url}api/publications/${id}/file`, { responseType: "blob" });
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${GLOBAL.url}api/publications/${id}/file/download`, { responseType: "blob" });
  }

  // Admin
  listAdminPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${GLOBAL.url}admin/publications`);
  }

  createPublication(data: PublicationFields, authors: SaveAuthorEntry[]): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/publications`, { data, authors });
  }

  updatePublication(id: number, data: PublicationFields, authors: SaveAuthorEntry[]): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/publications/${id}`, { data, authors });
  }

  deletePublication(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/publications/${id}`);
  }

  uploadFile(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/publications/${id}/file`, formData);
  }
}
