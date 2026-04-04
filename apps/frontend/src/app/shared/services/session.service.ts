import { registerLocaleData } from "@angular/common";
import localeEnglish from "@angular/common/locales/en";
import localeSpanish from "@angular/common/locales/es";
import { Injectable, signal } from "@angular/core";
import { createGrupo } from "@app/shared/models/factories";
import type { Grupo } from "@app/shared/models/grupo";

/**
 * SessionService owns all browser storage access.
 * Components use typed getters/setters instead of calling storage directly.
 * This centralizes null-handling and ensures type safety everywhere.
 */
@Injectable({ providedIn: "root" })
export class SessionService {
  private _locale = "es-Ar";

  set locale(value: string) {
    this._locale = value;
  }
  get locale(): string {
    return localStorage.getItem("locale") || "es-Ar";
  }

  registerCulture(culture: string): void {
    if (!culture) {
      return;
    }
    this.locale = culture;

    // Register locale data since only the en-US locale data comes with Angular
    switch (culture) {
      case "es-Ar": {
        localStorage.setItem("locale", "es-Ar");
        registerLocaleData(localeSpanish);
        break;
      }
      case "en-US": {
        localStorage.setItem("locale", "en-US");
        registerLocaleData(localeEnglish);
        break;
      }
    }
  }

  // Language ID
  setLanguageId(id: number): void {
    localStorage.setItem("lanId", JSON.stringify(id));
  }

  getLanguageId(): number {
    const stored = localStorage.getItem("lanId");
    if (!stored) return 0;
    try {
      return JSON.parse(stored);
    } catch {
      return 0;
    }
  }

  // Language object (cached to avoid unnecessary API calls on every page)
  setLanguageData<T>(data: T): void {
    localStorage.setItem("language", JSON.stringify(data));
  }

  /**
   * Get language object. Returns the parsed language data or null.
   * Caller should check for null before using.
   */
  getLanguageData<T>(): T | null {
    const stored = localStorage.getItem("language");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }

  // Research group info (cached to avoid unnecessary API calls on every page)
  setGrupoInfo(grupo: Grupo): void {
    localStorage.setItem("grupoInfo", JSON.stringify(grupo));
  }

  /** Get cached grupo info. Returns the parsed object or empty default. */
  getGrupoInfo(): Grupo {
    const stored = localStorage.getItem("grupoInfo");
    if (!stored) return createGrupo();
    try {
      return JSON.parse(stored);
    } catch {
      return createGrupo();
    }
  }

  clearGrupoInfo(): void {
    localStorage.removeItem("grupoInfo");
  }

  // Session ending flag (used by the deactivate guard to allow programmatic logouts to navigate through)
  private readonly _sessionEnding = signal(false);
  readonly sessionEnding = this._sessionEnding.asReadonly();

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
    sessionStorage.setItem("previous-page", path);
  }

  getPreviousPage(): string | null {
    return sessionStorage.getItem("previous-page");
  }

  // Back navigation: summary pages
  setResumenBack(path: string): void {
    localStorage.setItem("resumen-back", path);
  }

  getResumenBack(): string | null {
    return localStorage.getItem("resumen-back");
  }

  // Published news flag (used to trigger news refresh on home page after publishing a news item)
  private readonly _noticiaPublicada = signal(false);
  readonly noticiaPublicada = this._noticiaPublicada.asReadonly();

  setNoticiaPublicada(published: boolean): void {
    this._noticiaPublicada.set(published);
  }

  // Session clearing methods
  clearSession(): void {
    sessionStorage.clear();
  }

  clearAll(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
