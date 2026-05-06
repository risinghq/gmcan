import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { AdminPublicationListItem } from "../models/admin-list";
import type { SaveAuthorEntry } from "../models/author";
import type { PublicationWithAuthors } from "../models/publication";
import { GLOBAL } from "./global";

export interface PublicationFields {
  title: string;
  abstract?: string;
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

export interface AdminPublicationFilters {
  type?: number;
}

export interface CountTypeItem {
  name?: string;
  total?: string | number;
}

@Injectable({ providedIn: "root" })
export class PublicationService {
  private http = inject(HttpClient);

  // Public
  listPublications(filters?: PublicationFilters): Observable<PublicationWithAuthors[]> {
    return this.http.get<PublicationWithAuthors[]>(GLOBAL.api("publications"), {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  getPublication(id: number): Observable<PublicationWithAuthors> {
    return this.http.get<PublicationWithAuthors>(GLOBAL.api(`publications/${id}`));
  }

  countByType(): Observable<CountTypeItem[]> {
    return this.http.get<CountTypeItem[]>(GLOBAL.api("publications/count-by-type"));
  }

  getAsset(assetId: number): Observable<Blob> {
    return this.http.get(GLOBAL.api(`assets/${assetId}`), { responseType: "blob" });
  }

  downloadAsset(assetId: number): Observable<Blob> {
    return this.http.get(GLOBAL.api(`assets/${assetId}?download=true`), { responseType: "blob" });
  }

  // Admin
  listAdminPublications(filters?: AdminPublicationFilters): Observable<AdminPublicationListItem[]> {
    return this.http.get<AdminPublicationListItem[]>(GLOBAL.admin("publications"), {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  createPublication(data: PublicationFields, authors: SaveAuthorEntry[]): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("publications"), { data, authors });
  }

  updatePublication(id: number, data: PublicationFields, authors: SaveAuthorEntry[]): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`publications/${id}`), { data, authors });
  }

  deletePublication(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`publications/${id}`));
  }

  uploadAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(GLOBAL.admin(`assets/publication/${id}/file`), formData);
  }
}
