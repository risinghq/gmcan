import { Injectable, ErrorHandler, inject } from "@angular/core";
import { RedirectCommand, Router } from "@angular/router";

import type { NavigationAppError } from "./app-error";

@Injectable({ providedIn: "root" })
export class AppErrorHandlingService {
  private readonly errorHandler = inject(ErrorHandler);
  private readonly router = inject(Router);

  redirect(error: NavigationAppError, url: string): RedirectCommand {
    if (error.code === "not_found") {
      const area = url.startsWith("/dashboard") ? ["/dashboard"] : ["/"];
      return new RedirectCommand(this.router.createUrlTree([...area, "not-found"]), { skipLocationChange: true });
    }

    this.errorHandler.handleError(error.cause ?? error);
    return new RedirectCommand(this.router.createUrlTree(["/error"], { queryParams: { code: error.code } }));
  }

  handle(error: NavigationAppError): void {
    const { redirectTo, navigationBehaviorOptions } = this.redirect(error, this.router.url);
    void this.router.navigateByUrl(redirectTo, navigationBehaviorOptions);
  }
}
