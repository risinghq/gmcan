import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { GLOBAL } from "./global";
import { SessionService } from "./session.service";

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

@Injectable({ providedIn: "root" })
export class UsuarioService {
  private http = inject(HttpClient);
  private _session = inject(SessionService);

  public url: string;
  private readonly USER_KEY = "user";

  constructor() {
    this.url = GLOBAL.url;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error instanceof ErrorEvent
        ? error.error.message
        : (error.error?.message ?? `Error ${error.status}: ${error.statusText}`);
    return throwError(() => new Error(message));
  }

  login(user: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(this.url + "usuario/login", user).pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this._session.clearGrupoInfo();
  }

  verifyResetToken(data: ResetTokenData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + "email/verify-reset-token", data).pipe(catchError(this.handleError));
  }

  resetPassword(data: ResetPasswordData): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.url + "email/reset-password", { token: data.token, newPassword: data.password })
      .pipe(catchError(this.handleError));
  }

  changePassword(user: { password: string; correo: string }): Observable<ApiResponse> {
    return this.http
      .put<ApiResponse>(this.url + "usuario/update-password", { password: user.password, correo: user.correo })
      .pipe(catchError(this.handleError));
  }

  checkStatus(user: { correo: string }): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.url + "usuario/check-res/" + user.correo).pipe(catchError(this.handleError));
  }

  getUsuario(): Observable<any> {
    return this.http.get(this.url + "usuario/get-usuario-name").pipe(catchError(this.handleError));
  }

  getUser(idUsuario: string): Observable<any> {
    return this.http.get(this.url + "usuario/get-usuario/" + idUsuario).pipe(catchError(this.handleError));
  }

  getUsuarios(): Observable<any> {
    return this.http.get(this.url + "usuario/get-usuario").pipe(catchError(this.handleError));
  }

  getUsersActive(id: string): Observable<any> {
    return this.http.get(this.url + "usuario/get-usuario-active/" + id).pipe(catchError(this.handleError));
  }

  getFullUser(DNI: string): Observable<any> {
    return this.http.get(this.url + "usuario/get-usuario-full/" + DNI).pipe(catchError(this.handleError));
  }

  addUser(user: any): Observable<any> {
    return this.http.post(this.url + "usuario/post-usuario", user).pipe(catchError(this.handleError));
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(this.url + "usuario/update-usuario", user).pipe(catchError(this.handleError));
  }

  deleteUsuario(miembro: { DNI: string }): Observable<any> {
    return this.http.delete(this.url + "usuario/delete-usuario/" + miembro.DNI).pipe(catchError(this.handleError));
  }

  verifyUser(user: any): Observable<any> {
    return this.http.post(this.url + "usuario/verify-email", user).pipe(catchError(this.handleError));
  }

  uploadUsuarioFoto(fileData: File, id: string): Observable<any> {
    const formData = new FormData();
    formData.append("image", fileData, fileData.name);
    return this.http.put(this.url + "usuario/upload-usuario-file/" + id, formData).pipe(catchError(this.handleError));
  }

  deleteImage(idImage: string): Observable<any> {
    return this.http.delete(this.url + "usuario/erase-image/" + idImage).pipe(catchError(this.handleError));
  }

  getUserLogged(): any {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.USER_KEY);
  }
}
