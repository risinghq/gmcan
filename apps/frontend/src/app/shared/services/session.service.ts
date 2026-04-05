import { isPlatformBrowser, registerLocaleData } from "@angular/common";
import localeEnglish from "@angular/common/locales/en";
import localeSpanish from "@angular/common/locales/es";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";
import { Languages } from "@app/shared/models/languages";

/**
 * SessionService owns all browser storage access.
 * Components use typed getters/setters instead of calling storage directly.
 * This centralizes null-handling and ensures type safety everywhere.
 */
@Injectable({ providedIn: "root" })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  private readonly _appLocale = signal("es-Ar");
  private readonly _languageId = signal(0);
  private readonly _language = signal<(typeof Languages)[number]>(Languages[0]);
  private readonly _grupoInfo = signal<Grupo>(createGrupo());
  private readonly _noticiaPublicada = signal(false);
  private readonly _sessionEnding = signal(false);

  readonly language = this._language.asReadonly();
  readonly languageId = this._languageId.asReadonly();
  readonly localeSignal = this._appLocale.asReadonly();
  readonly grupoInfo = this._grupoInfo.asReadonly();
  readonly noticiaPublicada = this._noticiaPublicada.asReadonly();
  readonly sessionEnding = this._sessionEnding.asReadonly();

  get languageCode(): string {
    return this._language().locale;
  }

  set locale(value: string) {
    this.setAppLocale(value);
  }
  get locale(): string {
    return this._appLocale();
  }

  init(): void {
    const storedLocale = this.browser ? localStorage.getItem("locale") : null;
    const locale = this.resolveAppLocale(storedLocale ?? this.detectBrowserLocale());
    this.setAppLocale(locale, false);
  }

  registerCulture(culture: string): void {
    this.setAppLocale(culture, true);
  }

  setLanguage(language: (typeof Languages)[number], id = 0): void {
    const appLocale = this.resolveAppLocale(language.locale);
    this.setAppLocale(appLocale, true, language, id);
  }

  // Research group info (cached to avoid unnecessary API calls on every page)
  setGrupoInfo(grupo: Grupo): void {
    this._grupoInfo.set(grupo);
    if (this.browser) {
      localStorage.setItem("grupoInfo", JSON.stringify(grupo));
    }
  }

  /** Get cached grupo info. Returns the parsed object or empty default. */
  getGrupoInfo(): Grupo {
    return this._grupoInfo();
  }

  clearGrupoInfo(): void {
    this._grupoInfo.set(createGrupo());
    if (this.browser) {
      localStorage.removeItem("grupoInfo");
    }
  }

  // Session ending flag (used by the deactivate guard to allow programmatic logouts to navigate through)
  /** Call before programmatic logout so the deactivate guard allows navigation. */
  beginSessionEnd(): void {
    this._sessionEnding.set(true);
  }

  /** Called by the deactivate guard once it has allowed the navigation through. */
  acknowledgeSessionEnd(): void {
    this._sessionEnding.set(false);
  }

  // Back navigation: previous page
  setPreviousPage(path: string): void {
    if (this.browser) {
      sessionStorage.setItem("previous-page", path);
    }
  }

  getPreviousPage(): string | null {
    return this.browser ? sessionStorage.getItem("previous-page") : null;
  }

  // Back navigation: summary pages
  setResumenBack(path: string): void {
    if (this.browser) {
      localStorage.setItem("resumen-back", path);
    }
  }

  getResumenBack(): string | null {
    return this.browser ? localStorage.getItem("resumen-back") : null;
  }

  // Published news flag (used to trigger news refresh on home page after publishing a news item)
  setNoticiaPublicada(published: boolean): void {
    this._noticiaPublicada.set(published);
  }

  // Session clearing methods
  clearSession(): void {
    if (this.browser) {
      sessionStorage.clear();
    }
  }

  clearAll(): void {
    if (this.browser) {
      localStorage.clear();
      sessionStorage.clear();
    }
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

    this._appLocale.set(appLocale);
    this._language.set(language);
    this._languageId.set(resolvedLanguageId >= 0 ? resolvedLanguageId : 0);

    if (persist && this.browser) {
      localStorage.setItem("locale", appLocale);
    }

    if (appLocale === "en-US") {
      registerLocaleData(localeEnglish);
    } else {
      registerLocaleData(localeSpanish);
    }
  }

  private resolveLanguage(appLocale: string): (typeof Languages)[number] {
    return appLocale.startsWith("en") ? Languages[1] : Languages[0];
  }

  private resolveAppLocale(locale: string): string {
    return locale.startsWith("en") ? "en-US" : "es-Ar";
  }

  private detectBrowserLocale(): string {
    if (!this.browser) {
      return "es-Ar";
    }

    return navigator.language || "es-Ar";
  }
}
