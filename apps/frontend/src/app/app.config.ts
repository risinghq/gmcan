import { DatePipe, TitleCasePipe, registerLocaleData } from "@angular/common";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import localeEn from "@angular/common/locales/en";
import localeEsAr from "@angular/common/locales/es-AR";
import localePy from "@angular/common/locales/es-PY";
import localePt from "@angular/common/locales/pt";
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

import { routes } from "./app.routes";
import { SessionService } from "./services/session.service";
import { authInterceptor } from "./token.interceptor";

registerLocaleData(localePy, "es");
registerLocaleData(localePt, "pt");
registerLocaleData(localeEn, "en");
registerLocaleData(localeEsAr, "es-Ar");

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    DatePipe,
    TitleCasePipe,
    {
      provide: LOCALE_ID,
      deps: [SessionService],
      useFactory: (session: SessionService) => session.locale,
    },
  ],
};
