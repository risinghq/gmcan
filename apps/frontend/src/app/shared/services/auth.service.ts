import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly USER_KEY = "user";

  constructor(private http: HttpClient) {}

  login(user: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(`${GLOBAL.url}usuario/login`, user).pipe(
      tap((res) => {
        if (res?.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        }
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${GLOBAL.url}usuario/logout`, {}).pipe(tap(() => this.clearLocalStorage()));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.USER_KEY);
  }

  getUser(): any {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  clearLocalStorage(): void {
    const language = localStorage.getItem("language");
    localStorage.clear();
    if (language) localStorage.setItem("language", language);
  }
}
