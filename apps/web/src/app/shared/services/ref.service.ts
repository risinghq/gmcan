import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { RefDependenciesResponse } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface RefItem {
  id: number;
  name: string;
  nameSingular?: string;
}

export interface JournalItem {
  id: number;
  name: string;
}

export interface UniversityItem {
  id: number;
  name: string;
}

export interface FundingSourceItem {
  id: number;
  name: string;
}

export interface RefDependencyCount {
  newsTypeId: number;
  count: number;
  canDelete: boolean;
}

function ref(path: string): string {
  return GLOBAL.admin(`ref/${path}`);
}

@Injectable({ providedIn: "root" })
export class RefService {
  private http = inject(HttpClient);

  listNewsTypes(): Observable<RefItem[]> {
    return this.http.get<RefItem[]>(ref("news-type"));
  }

  createNewsType(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(ref("news-type"), body);
  }

  updateNewsType(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(ref(`news-type/${id}`), body);
  }

  deleteNewsType(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(ref(`news-type/${id}`));
  }

  getNewsTypeCount(id: number): Observable<RefDependencyCount> {
    return this.http.get<RefDependencyCount>(ref(`news-type/${id}/count`));
  }

  listJournals(): Observable<JournalItem[]> {
    return this.http.get<JournalItem[]>(ref("journal"));
  }

  createJournal(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(ref("journal"), body);
  }

  updateJournal(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(ref(`journal/${id}`), body);
  }

  deleteJournal(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(ref(`journal/${id}`));
  }

  getJournalDependencies(id: number): Observable<RefDependenciesResponse> {
    return this.http.get<RefDependenciesResponse>(ref(`journal/${id}/dependencies`));
  }

  listUniversities(): Observable<UniversityItem[]> {
    return this.http.get<UniversityItem[]>(ref("university"));
  }

  createUniversity(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(ref("university"), body);
  }

  updateUniversity(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(ref(`university/${id}`), body);
  }

  deleteUniversity(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(ref(`university/${id}`));
  }

  getUniversityDependencies(id: number): Observable<RefDependenciesResponse> {
    return this.http.get<RefDependenciesResponse>(ref(`university/${id}/dependencies`));
  }

  getEventDependencies(id: number): Observable<RefDependenciesResponse> {
    return this.http.get<RefDependenciesResponse>(ref(`event/${id}/dependencies`));
  }

  listFundingSources(): Observable<FundingSourceItem[]> {
    return this.http.get<FundingSourceItem[]>(ref("funding-source"));
  }

  getFundingSource(id: number): Observable<FundingSourceItem> {
    return this.http.get<FundingSourceItem>(ref(`funding-source/${id}`));
  }

  createFundingSource(body: { name: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(ref("funding-source"), body);
  }

  updateFundingSource(id: number, body: { name: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(ref(`funding-source/${id}`), body);
  }

  deleteFundingSource(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(ref(`funding-source/${id}`));
  }
}
