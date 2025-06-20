import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { GLOBAL } from "./global";

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

export interface ResetTokenData {
  token: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  state?: number;
  user?: string;
}

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  public url: string;
  private readonly JWT_TOKEN = "JWT_TOKEN";
  private readonly USER_KEY = "user";
  private languagelocal: string;

  constructor(private http: HttpClient) {
    this.url = GLOBAL.url;
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    try {
      const language = JSON.parse(
        localStorage.getItem("language") || '{"locale":"es"}',
      );
      this.languagelocal = language.locale || "es";
    } catch (error) {
      console.error("Error parsing language from localStorage:", error);
      this.languagelocal = "es";
    }
  }

  private createHeaders(includeAuth = false): HttpHeaders {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    if (includeAuth) {
      const token = localStorage.getItem(this.JWT_TOKEN);
      if (token) {
        headers = headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error("HTTP Error:", error);

    let errorMessage = "Error interno del servidor";

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        (error && error.error && error.error.message) ||
        `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  login(user: { correo: string; password: string }): Observable<LoginResponse> {
    const body = { correo: user.correo, password: user.password };
    const headers = this.createHeaders();

    return this.http
      .post<LoginResponse>(this.url + "usuario/login", body, { headers })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem("grupoInfo");
  }

  verifyResetToken(data: ResetTokenData): Observable<ApiResponse> {
    const headers = this.createHeaders();

    return this.http
      .post<ApiResponse>(this.url + "email/verify-reset-token", data, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  resetPassword(data: ResetPasswordData): Observable<ApiResponse> {
    const headers = this.createHeaders();
    const body = { token: data.token, newPassword: data.password };

    return this.http
      .post<ApiResponse>(this.url + "email/reset-password", body, { headers })
      .pipe(catchError(this.handleError));
  }

  changePassword(user: {
    password: string;
    correo: string;
    token: string;
  }): Observable<ApiResponse> {
    const body = { password: user.password, correo: user.correo };
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    });

    return this.http
      .put<ApiResponse>(this.url + "usuario/update-password", body, { headers })
      .pipe(catchError(this.handleError));
  }

  checkStatus(user: { correo: string }): Observable<ApiResponse> {
    const headers = this.createHeaders(true);

    return this.http
      .get<ApiResponse>(this.url + "usuario/check-res/" + user.correo, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  getUsuario(): Observable<any> {
    const headers = this.createHeaders();
    return this.http
      .get(this.url + "usuario/get-usuario-name", { headers })
      .pipe(catchError(this.handleError));
  }

  getUser(idUsuario: string): Observable<any> {
    const headers = this.createHeaders();
    const endpoint =
      this.languagelocal === "es"
        ? "usuario/get-usuario/"
        : "usuario/get-usuario-en/";

    return this.http
      .get(this.url + endpoint + idUsuario, { headers })
      .pipe(catchError(this.handleError));
  }

  getUsuarios(): Observable<any> {
    const headers = this.createHeaders();
    const endpoint =
      this.languagelocal === "es"
        ? "usuario/get-usuario"
        : "usuario/get-usuario-en";

    return this.http
      .get(this.url + endpoint, { headers })
      .pipe(catchError(this.handleError));
  }

  getUsersActive(id: string): Observable<any> {
    const headers = this.createHeaders(true);

    return this.http
      .get(this.url + "usuario/get-usuario-active/" + id, { headers })
      .pipe(catchError(this.handleError));
  }

  getFullUser(DNI: string): Observable<any> {
    const headers = this.createHeaders(true);

    return this.http
      .get(this.url + "usuario/get-usuario-full/" + DNI, { headers })
      .pipe(catchError(this.handleError));
  }

  addUser(user: any): Observable<any> {
    const headers = this.createHeaders(true);

    return this.http
      .post(this.url + "usuario/post-usuario", user, { headers })
      .pipe(catchError(this.handleError));
  }

  updateUser(user: any): Observable<any> {
    const headers = this.createHeaders(true);

    return this.http
      .put(this.url + "usuario/update-usuario", user, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteUsuario(miembro: { DNI: string }): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem(this.JWT_TOKEN)}`,
    });

    return this.http
      .delete(this.url + "usuario/delete-usuario/" + miembro.DNI, { headers })
      .pipe(catchError(this.handleError));
  }

  verifyUser(user: any): Observable<any> {
    const headers = this.createHeaders(true);

    return this.http
      .post(this.url + "usuario/verify-email", user, { headers })
      .pipe(catchError(this.handleError));
  }

  uploadUsuarioFoto(fileData: File, id: string): Observable<any> {
    const formData = new FormData();
    formData.append("image", fileData, fileData.name);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem(this.JWT_TOKEN)}`,
    });

    return this.http
      .put(this.url + "usuario/upload-usuario-file/" + id, formData, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  deleteImage(idImage: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem(this.JWT_TOKEN)}`,
    });

    return this.http
      .delete(this.url + "usuario/erase-image/" + idImage, { headers })
      .pipe(catchError(this.handleError));
  }

  // Utility methods
  getUserLogged(): any {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.JWT_TOKEN);
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  setToken(token: string): void {
    localStorage.setItem(this.JWT_TOKEN, token);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
