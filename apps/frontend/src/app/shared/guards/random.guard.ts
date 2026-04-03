import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

const checkLoggedIn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isLoggedIn()) {
    router.navigate(["/login"]);
  }
  return authService.isLoggedIn();
};

export const randomGuard: CanActivateFn = () => checkLoggedIn();
export const randomMatchGuard: CanMatchFn = () => checkLoggedIn();
