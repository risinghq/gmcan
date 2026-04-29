import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

export interface MembershipApplication {
  nombre: string;
  razon: string;
  correo: string;
  telefono: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

export interface PasswordResetRequest {
  email: string;
}

@Injectable({ providedIn: "root" })
export class EmailService {
  private http = inject(HttpClient);

  sendMembershipApplication(application: MembershipApplication): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${GLOBAL.url}api/email`, application);
  }

  sendPasswordReset(request: PasswordResetRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${GLOBAL.url}admin/auth/password-reset`, request);
  }

  verifyResetToken(token: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${GLOBAL.url}admin/auth/verify-reset-token`, { token });
  }

  resetPassword(token: string, newPassword: string): Observable<{ status: number }> {
    return this.http.post<{ status: number }>(`${GLOBAL.url}admin/auth/reset-password`, { token, newPassword });
  }
}
