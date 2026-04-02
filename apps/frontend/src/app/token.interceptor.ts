import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";

import { environment } from "../environments/environment";
import { AuthService } from "./services/auth.service";

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getJwtToken()) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${authService.getJwtToken()}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const refreshUrl = `${environment.apiUrl}/usuario/refresh`;
        if (error.url !== refreshUrl) {
          return handle401Error(req, next, authService, router);
        } else {
          authService.removeTokens();
          router.navigate(["/login"]);
          return throwError(() => error);
        }
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  req: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  router: Router,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((token: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(token.jwt);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${token.jwt}` } }));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.removeTokens();
        router.navigate(["/login"]);
        return throwError(() => error);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((jwt) => next(req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } }))),
  );
}
