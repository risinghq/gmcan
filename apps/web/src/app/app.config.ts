import { DatePipe, TitleCasePipe, registerLocaleData } from "@angular/common";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import localeEn from "@angular/common/locales/en";
import localeEsAr from "@angular/common/locales/es-AR";
import localePy from "@angular/common/locales/es-PY";
import localePt from "@angular/common/locales/pt";
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
  RedirectCommand,
  Router,
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from "@angular/router";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { AppErrorHandlingService } from "@app/shared/errors/app-error-handling.service";
import { AppTitleStrategy } from "@app/shared/routing/app-title.strategy";
import { SessionService } from "@app/shared/services/session.service";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

import { routes } from "./app.routes";
import { authInterceptor } from "./token.interceptor";

registerLocaleData(localePy, "es");
registerLocaleData(localePt, "pt");
registerLocaleData(localeEn, "en");
registerLocaleData(localeEsAr, "es-Ar");

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler((error) => {
        const mapped = toNavigationAppError(error.error ?? error);
        inject(AppErrorHandlingService).handle(mapped);
        const urlTree = inject(Router).createUrlTree(["/error"], { queryParams: { code: mapped.code } });
        return new RedirectCommand(urlTree);
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    DatePipe,
    TitleCasePipe,
    provideAppInitializer(() => inject(SessionService).init()),
    {
      provide: LOCALE_ID,
      deps: [SessionService],
      useFactory: (session: SessionService) => session.locale,
    },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
