import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface RefItem {
  id: number;
  name: string;
  nameEN?: string;
  nameSingular?: string;
  nameSingularEN?: string;
}

export interface JournalItem {
  id: number;
  name: string;
}

export interface UniversityItem {
  id: number;
  name: string | null;
  nameEN: string | null;
}

export interface FundingSourceItem {
  id: number;
  name: string;
}

@Injectable({ providedIn: "root" })
export class RefService {
  private http = inject(HttpClient);

  // News types
  listNewsTypes(): Observable<RefItem[]> {
    return this.http.get<RefItem[]>(`${GLOBAL.url}admin/ref/news-type`);
  }

  createNewsType(body: { name: string; nameEN?: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/ref/news-type`, body);
  }

  updateNewsType(id: number, body: { name: string; nameEN?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/ref/news-type/${id}`, body);
  }

  deleteNewsType(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/ref/news-type/${id}`);
  }

  // Journals
  listJournals(): Observable<JournalItem[]> {
    return this.http.get<JournalItem[]>(`${GLOBAL.url}admin/ref/journal`);
  }

  createJournal(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/ref/journal`, body);
  }

  updateJournal(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/ref/journal/${id}`, body);
  }

  deleteJournal(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/ref/journal/${id}`);
  }

  // Universities
  listUniversities(): Observable<UniversityItem[]> {
    return this.http.get<UniversityItem[]>(`${GLOBAL.url}admin/ref/university`);
  }

  createUniversity(body: { name: string; nameEN?: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/ref/university`, body);
  }

  updateUniversity(id: number, body: { name: string; nameEN?: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/ref/university/${id}`, body);
  }

  deleteUniversity(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/ref/university/${id}`);
  }

  // Funding sources
  listFundingSources(): Observable<FundingSourceItem[]> {
    return this.http.get<FundingSourceItem[]>(`${GLOBAL.url}admin/ref/funding-source`);
  }

  getFundingSource(id: number): Observable<FundingSourceItem> {
    return this.http.get<FundingSourceItem>(`${GLOBAL.url}admin/ref/funding-source/${id}`);
  }

  createFundingSource(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${GLOBAL.url}admin/ref/funding-source`, body);
  }

  updateFundingSource(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(`${GLOBAL.url}admin/ref/funding-source/${id}`, body);
  }

  deleteFundingSource(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(`${GLOBAL.url}admin/ref/funding-source/${id}`);
  }
}
