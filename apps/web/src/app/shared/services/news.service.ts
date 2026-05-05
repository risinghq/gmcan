import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { AdminNewsListQuery, AdminNewsListResponse } from "../models/admin-list";
import type { News, PublicNewsDetail, PublicNewsListQuery, PublicNewsListResponse } from "../models/news";
import { GLOBAL } from "./global";

export interface NewsUpsertBody {
  title: string;
  summary: string;
  body: string;
  status: number;
  publishedAt?: string;
  authorId: number;
  newsTypeId: number;
  priority?: number;
}

@Injectable({ providedIn: "root" })
export class NewsService {
  private http = inject(HttpClient);

  // Public
  listNews(query: PublicNewsListQuery = {}): Observable<PublicNewsListResponse> {
    return this.http.get<PublicNewsListResponse>(`${GLOBAL.url}api/news`, { params: { ...query } });
  }

  getNews(id: number): Observable<PublicNewsDetail> {
    return this.http.get<PublicNewsDetail>(`${GLOBAL.url}api/news/${id}`);
  }

  // Admin
  listAdminNews(query: AdminNewsListQuery): Observable<AdminNewsListResponse> {
    return this.http.get<AdminNewsListResponse>(`${GLOBAL.url}admin/news`, { params: { ...query } });
  }

  getAdminNews(id: number): Observable<News> {
    return this.http.get<News>(`${GLOBAL.url}admin/news/${id}`);
  }

  createNews(data: NewsUpsertBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/news`, data);
  }

  updateNews(id: number, data: NewsUpsertBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/news/${id}`, data);
  }

  deleteNews(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/news/${id}`);
  }

  uploadAsset(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("asset", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/assets/news/${id}/photo`, formData);
  }

  deleteAsset(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/assets/news/${id}/photo`);
  }
}
