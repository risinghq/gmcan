import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { GLOBAL } from "@app/shared/services/global";
import { SessionService } from "@app/shared/services/session.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const session = inject(SessionService);
  const isAdminRequest = req.url.includes("/admin/");
  const isPublicApiRequest = GLOBAL.isPublicApiRequest(req.url);
  // The dashboard is written in Spanish, so its content comes back in Spanish whatever the browser prefers.
  const language = isAdminRequest ? "es" : session.language().locale === "en" ? "en" : "es";
  const request = req.clone({
    withCredentials: true,
    ...(isPublicApiRequest || isAdminRequest ? { setHeaders: { "Accept-Language": language } } : {}),
  });

  return next(request).pipe(
    catchError((error) => {
      if (isAdminRequest && error instanceof HttpErrorResponse && error.status === 401) {
        auth.clearSessionState();
        if (router.url.startsWith("/dashboard")) {
          router.navigate(["/login"]);
        }
      }
      return throwError(() => error);
    }),
  );
};
