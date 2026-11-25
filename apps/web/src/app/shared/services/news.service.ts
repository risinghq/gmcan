import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AdminNews, NewsWrite } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import type { AdminNewsListQuery, AdminNewsListResponse } from "../models/admin-list";
import type { PublicNewsDetail, PublicNewsListQuery, PublicNewsListResponse } from "../models/news";
import { GLOBAL } from "./global";

/** Query parameters without the unset ones: HttpClient would send an undefined value as the text "undefined". */
function definedParams(query: object): Record<string, string | number | boolean> {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== null));
}

@Injectable({ providedIn: "root" })
export class NewsService {
  private http = inject(HttpClient);

  listNews(query: PublicNewsListQuery = {}): Observable<PublicNewsListResponse> {
    return this.http.get<PublicNewsListResponse>(GLOBAL.api("news"), { params: definedParams(query) });
  }

  getNews(id: number): Observable<PublicNewsDetail> {
    return this.http.get<PublicNewsDetail>(GLOBAL.api(`news/${id}`));
  }

  listAdminNews(query: AdminNewsListQuery): Observable<AdminNewsListResponse> {
    return this.http.get<AdminNewsListResponse>(GLOBAL.admin("news"), { params: definedParams(query) });
  }

  getAdminNews(id: number): Observable<AdminNews> {
    return this.http.get<AdminNews>(GLOBAL.admin(`news/${id}`));
  }

  createNews(data: NewsWrite): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(GLOBAL.admin("news"), data);
  }

  updateNews(id: number, data: NewsWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin(`news/${id}`), data);
  }

  deleteNews(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(GLOBAL.admin(`news/${id}`));
  }
}
