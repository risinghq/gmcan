import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
  withNoIncrementalHydration,
} from "@angular/platform-browser";
import { provideRouter, TitleStrategy, withComponentInputBinding, withNavigationErrorHandler } from "@angular/router";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { AppErrorHandlingService } from "@app/shared/errors/app-error-handling.service";
import { AppTitleStrategy } from "@app/shared/routing/app-title.strategy";
import { GLOBAL } from "@app/shared/services/global";
import { LookupService } from "@app/shared/services/lookup.service";

import { routes } from "./app.routes";
import { authInterceptor } from "./token.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler((error) =>
        inject(AppErrorHandlingService).redirect(toNavigationAppError(error.error ?? error), error.url),
      ),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(
      withEventReplay(),
      withNoIncrementalHydration(),
      // authInterceptor sends every request with credentials, which Angular excludes from the transfer cache by
      // default. Public API responses carry no per-user data, so they are safe to embed in the server-rendered page.
      withHttpTransferCacheOptions({
        includeRequestsWithCredentials: true,
        filter: (req) => GLOBAL.isPublicApiRequest(req.url),
      }),
    ),
    provideAppInitializer(() => inject(LookupService).load()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
