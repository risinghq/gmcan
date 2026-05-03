import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const isAdminRequest = req.url.includes("/admin/");
  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error) => {
      if (isAdminRequest && error instanceof HttpErrorResponse && error.status === 401) {
        auth.clearSessionState();
        router.navigate(["/login"]);
      }
      return throwError(() => error);
    }),
  );
};
