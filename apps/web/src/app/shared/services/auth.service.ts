import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { catchError } from "rxjs/operators";

import type { Member, MemberFull } from "../models/member";
import { AuthzService } from "./authz.service";
import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private authz = inject(AuthzService);
  private readonly current = signal<Member | null>(null);
  /** The signed-in member as the last login or `account/me` read returned them. */
  readonly user = this.current.asReadonly();

  login(credentials: { email: string; password: string }): Observable<{ user: Member }> {
    return this.http.post<{ user: Member }>(GLOBAL.admin("auth/login"), credentials).pipe(
      tap((res) => {
        if (res?.user) {
          this.current.set(res.user);
          this.authz.setCapabilities(res.user.capabilities);
        }
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(GLOBAL.admin("auth/logout"), {}).pipe(tap(() => this.clearSessionState()));
  }

  getUser(): Member | null {
    return this.current();
  }

  fetchCurrentUser(): Observable<MemberFull> {
    return this.http.get<MemberFull>(GLOBAL.admin("account/me")).pipe(
      tap((user) => {
        this.current.set(user);
        this.authz.setCapabilities(user.capabilities);
      }),
    );
  }

  updateMyPassword(params: { newPassword: string }): Observable<{ status: number }> {
    return this.http.put<{ status: number }>(GLOBAL.admin("account/password"), {
      password: params.newPassword,
    });
  }

  tryRestoreSession(): Observable<MemberFull | null> {
    const user = this.current();
    if (user) return of(user as MemberFull);
    return this.fetchCurrentUser().pipe(catchError(() => of(null)));
  }

  clearSessionState(): void {
    this.current.set(null);
    this.authz.setCapabilities([]);
  }
}
