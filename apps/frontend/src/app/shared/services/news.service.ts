import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import type { News } from "../models/news";
import { GLOBAL } from "./global";

export interface NewsBody {
  title?: string;
  titleEN?: string;
  summary?: string;
  summaryEN?: string;
  body?: string;
  bodyEN?: string;
  status?: number;
  publishedAt?: string;
  authorId?: number;
  newsTypeId?: number;
  priority?: number;
}

@Injectable({ providedIn: "root" })
export class NewsService {
  private http = inject(HttpClient);

  // Public
  listNews(status?: number): Observable<News[]> {
    const params: Record<string, string | number> = {};
    if (status !== undefined) params["status"] = status;
    return this.http.get<News[]>(`${GLOBAL.url}api/news`, { params });
  }

  getNews(id: number): Observable<News> {
    return this.http.get<News>(`${GLOBAL.url}api/news/${id}`);
  }

  // Admin
  listAdminNews(): Observable<News[]> {
    return this.http.get<News[]>(`${GLOBAL.url}admin/news`);
  }

  getAdminNews(id: number): Observable<News> {
    return this.http.get<News>(`${GLOBAL.url}admin/news/${id}`);
  }

  createNews(data: NewsBody): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/news`, data);
  }

  updateNews(id: number, data: NewsBody): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/news/${id}`, data);
  }

  deleteNews(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/news/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<{ status: number }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/news/${id}/photo`, formData);
  }

  deletePhoto(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/news/${id}/photo`);
  }
}
