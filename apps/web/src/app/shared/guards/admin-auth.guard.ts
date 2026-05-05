import { inject } from "@angular/core";
import { CanActivateChildFn, CanMatchFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { map, type Observable } from "rxjs";

function requireAdminSession(): Observable<boolean | UrlTree> {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.tryRestoreSession().pipe(map((user) => (user ? true : router.createUrlTree(["/login"]))));
}

export const adminCanMatchGuard: CanMatchFn = () => requireAdminSession();

export const adminCanActivateChildGuard: CanActivateChildFn = () => requireAdminSession();
