import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type {
  PublicationKindCode,
  PublicPublicationWithAuthors,
  ThesisKindCode,
} from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import type { AdminPublicationListItem } from "../models/admin-list";
import type { SaveAuthorEntry } from "../models/author";
import { GLOBAL } from "./global";

export interface PublicationFields {
  doi?: string;
  publishedAt: string;
  subtype:
    | { kindCode: "journal_article"; journalArticle: { journalId?: number; issue?: number } }
    | { kindCode: "conference_paper"; conferencePaper: { eventId: number } }
    | { kindCode: "thesis"; thesis: { universityId: number; thesisKindCode: ThesisKindCode } };
  translations: Record<string, { title: string; abstract?: string }>;
}

export interface PublicationFilters {
  kindCode?: PublicationKindCode;
  event?: number;
  journal?: number;
  university?: number;
}

export interface AdminPublicationFilters {
  kindCode?: "journal_article" | "conference_paper" | "thesis";
}

@Injectable({ providedIn: "root" })
export class PublicationService {
  private http = inject(HttpClient);

  // Public
  listPublications(filters?: PublicationFilters): Observable<PublicPublicationWithAuthors[]> {
    return this.http.get<PublicPublicationWithAuthors[]>(GLOBAL.api("publications"), {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  getPublication(id: number): Observable<PublicPublicationWithAuthors> {
    return this.http.get<PublicPublicationWithAuthors>(GLOBAL.api(`publications/${id}`));
  }

  getAsset(assetId: number): Observable<Blob> {
    return this.http.get(GLOBAL.api(`assets/${assetId}`), { responseType: "blob" });
  }

  downloadAsset(assetId: number): Observable<Blob> {
    return this.http.get(GLOBAL.api(`assets/${assetId}/download`), { responseType: "blob" });
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
