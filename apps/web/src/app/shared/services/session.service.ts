import { DOCUMENT, isPlatformBrowser, registerLocaleData } from "@angular/common";
import localeEnglish from "@angular/common/locales/en";
import localeSpanish from "@angular/common/locales/es";
import { Injectable, PLATFORM_ID, REQUEST, inject, signal } from "@angular/core";
import { Languages } from "@app/shared/models/languages";
import { languageCookie, resolveSiteLanguage } from "@app/shared/site-language";

@Injectable({ providedIn: "root" })
export class SessionService {
  private static readonly DEFAULT_APP_LOCALE = "es-PE";
  private static readonly ENGLISH_APP_LOCALE = "en-US";

  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });

  private readonly appLocaleState = signal(SessionService.DEFAULT_APP_LOCALE);
  private readonly languageIdState = signal(0);
  private readonly languageState = signal<(typeof Languages)[number]>(Languages[0]);

  readonly language = this.languageState.asReadonly();
  readonly languageId = this.languageIdState.asReadonly();
  readonly localeSignal = this.appLocaleState.asReadonly();

  set locale(value: string) {
    this.setAppLocale(value);
  }
  get locale(): string {
    return this.appLocaleState();
  }

  init(): void {
    const language = this.browser
      ? resolveSiteLanguage({
          url: this.document.location.href,
          cookie: this.document.cookie,
          acceptLanguage: navigator.languages.join(","),
        })
      : resolveSiteLanguage({
          url: this.request?.url ?? "/",
          cookie: this.request?.headers.get("cookie"),
          acceptLanguage: this.request?.headers.get("accept-language"),
        });
    this.setAppLocale(language);
  }

  registerCulture(culture: string): void {
    this.setAppLocale(culture, true);
  }

  setLanguage(language: (typeof Languages)[number], id = 0): void {
    const appLocale = this.resolveAppLocale(language.locale);
    this.setAppLocale(appLocale, true, language, id);
  }

  private setAppLocale(
    locale: string,
    persist = true,
    languageOverride?: (typeof Languages)[number],
    languageId?: number,
  ): void {
    const appLocale = this.resolveAppLocale(locale);
    const language = languageOverride ?? this.resolveLanguage(appLocale);
    const resolvedLanguageId = languageId ?? Languages.findIndex((item) => item.locale === language.locale);

    this.appLocaleState.set(appLocale);
    this.languageState.set(language);
    this.languageIdState.set(resolvedLanguageId >= 0 ? resolvedLanguageId : 0);

    if (persist && this.browser) {
      this.document.cookie = languageCookie(language.locale === "en" ? "en" : "es");
    }

    if (appLocale === SessionService.ENGLISH_APP_LOCALE) {
      registerLocaleData(localeEnglish);
    } else {
      registerLocaleData(localeSpanish);
    }
  }

  private resolveLanguage(appLocale: string): (typeof Languages)[number] {
    return appLocale.startsWith("en") ? Languages[1] : Languages[0];
  }

  private resolveAppLocale(locale: string): string {
    return locale.startsWith("en") ? SessionService.ENGLISH_APP_LOCALE : SessionService.DEFAULT_APP_LOCALE;
  }
}
