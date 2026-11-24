import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { RefDependenciesResponse } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface JournalItem {
  id: number;
  name: string;
}

export interface UniversityItem {
  id: number;
  name: string;
}

function ref(path: string): string {
  return GLOBAL.admin(`ref/${path}`);
}

@Injectable({ providedIn: "root" })
export class RefService {
  private http = inject(HttpClient);

  listJournals(): Observable<JournalItem[]> {
    return this.http.get<JournalItem[]>(ref("journal"));
  }

  getJournal(id: number): Observable<JournalItem> {
    return this.http.get<JournalItem>(ref(`journal/${id}`));
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
}
