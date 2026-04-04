import { HttpClient, HttpHeaders } from "@angular/common/http";
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
  correo: string;
}

@Injectable({
  providedIn: "root",
})
export class EmailService {
  private http = inject(HttpClient);

  private readonly url: string;
  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
  });

  constructor() {
    this.url = GLOBAL.url;
  }

  sendMembershipApplication(application: MembershipApplication): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.url}email/send-email`, application, {
      headers: this.headers,
    });
  }

  sendPasswordReset(request: PasswordResetRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.url}email/send-password-reset`, request, {
      headers: this.headers,
    });
  }

  verifyResetToken(token: string): Observable<any> {
    return this.http.post(`${this.url}email/verify-reset-token`, { token }, { headers: this.headers });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.url}email/reset-password`, { token, newPassword }, { headers: this.headers });
  }
}
