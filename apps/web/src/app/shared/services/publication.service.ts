import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type {
  AdminPublication,
  AdminPublicationListItem,
  AdminPublicationListQuery,
  PublicationWrite,
} from "@gmcan/contracts/admin";
import type { PublicationCounts, PublicationKindCode, PublicPublicationWithAuthors } from "@gmcan/contracts/public";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface PublicationFilters {
  kindCode?: PublicationKindCode;
  event?: number;
  journal?: number;
  university?: number;
  limit?: number;
}

@Injectable({ providedIn: "root" })
export class PublicationService {
  private http = inject(HttpClient);

  listPublications(filters?: PublicationFilters): Observable<PublicPublicationWithAuthors[]> {
    return this.http.get<PublicPublicationWithAuthors[]>(GLOBAL.api("publications"), {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  countPublications(): Observable<PublicationCounts> {
    return this.http.get<PublicationCounts>(GLOBAL.api("publications/counts"));
  }

  listAdminPublications(filters?: AdminPublicationListQuery): Observable<AdminPublicationListItem[]> {
    return this.http.get<AdminPublicationListItem[]>(GLOBAL.admin("publications"), {
      params: filters as Record<string, string | number> | undefined,
    });
  }

  getAdminPublication(id: number): Observable<AdminPublication> {
    return this.http.get<AdminPublication>(GLOBAL.admin(`publications/${id}`));
  }

  createPublication(body: PublicationWrite): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("publications"), body);
  }

  updatePublication(id: number, body: PublicationWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`publications/${id}`), body);
  }

  deletePublication(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`publications/${id}`));
  }
}
