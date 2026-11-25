import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Translations } from "@gmcan/contracts/admin";
import { Observable, map } from "rxjs";

import { primaryName } from "../forms/locale-form";
import { GLOBAL } from "./global";

export interface JournalItem {
  id: number;
  name: string;
}

export interface UniversityItem {
  id: number;
  name: string;
}

export interface UniversityWrite {
  translations: Translations<{ name: string }>;
}

/** `GET /admin/ref/university/:id`. */
export interface AdminUniversity extends UniversityWrite {
  id: number;
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

  /** Each university under the name an admin list shows. */
  listUniversities(): Observable<UniversityItem[]> {
    return this.http
      .get<AdminUniversity[]>(ref("university"))
      .pipe(map((rows) => rows.map(({ id, translations }) => ({ id, name: primaryName(translations) }))));
  }

  getUniversity(id: number): Observable<AdminUniversity> {
    return this.http.get<AdminUniversity>(ref(`university/${id}`));
  }

  createUniversity(body: UniversityWrite): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(ref("university"), body);
  }

  updateUniversity(id: number, body: UniversityWrite): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(ref(`university/${id}`), body);
  }

  deleteUniversity(id: number): Observable<{ status: number }> {
    return this.http.delete<{ status: number }>(ref(`university/${id}`));
  }
}
