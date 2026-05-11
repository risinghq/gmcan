import { Injectable, ErrorHandler, inject } from "@angular/core";
import { Router } from "@angular/router";

import type { NavigationAppError } from "./app-error";

@Injectable({ providedIn: "root" })
export class AppErrorHandlingService {
  private readonly errorHandler = inject(ErrorHandler);
  private readonly router = inject(Router);

  handle(error: NavigationAppError): void {
    this.errorHandler.handleError(error.cause ?? error);
    void this.router.navigate(["/error"], {
      queryParams: { code: error.code },
    });
  }
}
