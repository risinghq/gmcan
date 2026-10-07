import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface MembershipApplication {
  name: string;
  reason: string;
  email: string;
  phone: string;
}

export interface StatusResponse {
  status: number;
}

@Injectable({ providedIn: "root" })
export class EmailService {
  private http = inject(HttpClient);

  sendMembershipApplication(application: MembershipApplication): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(GLOBAL.api("email/contact"), application);
  }

  /** Every address gets the same answer. The link reaches the member by email only. */
  requestPasswordReset(email: string): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(GLOBAL.api("email/password-reset/request"), { email });
  }

  /** Return 400 when the token is unknown or expired. */
  verifyResetToken(token: string): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(GLOBAL.api("email/password-reset/verify"), { token });
  }

  resetPassword(token: string, newPassword: string): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(GLOBAL.api("email/password-reset/confirm"), { token, newPassword });
  }
}
