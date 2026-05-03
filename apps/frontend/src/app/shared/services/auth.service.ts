import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { catchError } from "rxjs/operators";

import type { Member, MemberFull } from "../models/member";
import { AuthzService } from "./authz.service";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private authz = inject(AuthzService);
  private currentUser: Member | null = null;

  login(credentials: { email: string; password: string }): Observable<{ user: Member }> {
    return this.http.post<{ user: Member }>(`${GLOBAL.url}admin/auth/login`, credentials).pipe(
      tap((res) => {
        if (res?.user) {
          this.currentUser = res.user;
          this.authz.setCapabilities(res.user.capabilities);
        }
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${GLOBAL.url}admin/auth/logout`, {}).pipe(tap(() => this.clearSessionState()));
  }

  getUser(): Member | null {
    return this.currentUser;
  }

  fetchCurrentUser(): Observable<MemberFull> {
    return this.http.get<MemberFull>(`${GLOBAL.url}admin/account/me`).pipe(
      tap((user) => {
        this.currentUser = user;
        this.authz.setCapabilities(user.capabilities);
      }),
    );
  }

  tryRestoreSession(): Observable<MemberFull | null> {
    if (this.currentUser) return of(this.currentUser as MemberFull);
    return this.fetchCurrentUser().pipe(catchError(() => of(null)));
  }

  clearSessionState(): void {
    this.currentUser = null;
    this.authz.setCapabilities([]);
  }
}
