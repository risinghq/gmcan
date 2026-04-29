import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, tap } from "rxjs";

import type { Member } from "../models/member";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);

  private readonly USER_KEY = "user";

  login(credentials: { email: string; password: string }): Observable<{ user: Member }> {
    return this.http.post<{ user: Member }>(`${GLOBAL.url}admin/auth/login`, credentials).pipe(
      tap((res) => {
        if (res?.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        }
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${GLOBAL.url}admin/auth/logout`, {}).pipe(tap(() => this.clearLocalStorage()));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.USER_KEY);
  }

  getUser(): Member | null {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  clearLocalStorage(): void {
    const locale = localStorage.getItem("locale");
    localStorage.clear();
    if (locale) localStorage.setItem("locale", locale);
  }
}
