import { registerLocaleData } from "@angular/common";
import localeEnglish from "@angular/common/locales/en";
import localeSpanish from "@angular/common/locales/es";
import { Injectable } from "@angular/core";
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

  // ===== LOCALE =====
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

  // ===== LANGUAGE ID (0-based index) =====
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

  // ===== LANGUAGE OBJECT (full language data) =====
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

  // ===== GRUPO INFO =====
  setGrupoInfo(grupo: Grupo): void {
    localStorage.setItem("grupoInfo", JSON.stringify(grupo));
  }

  /**
   * Get cached grupo info. Returns the parsed object or empty default.
   */
  getGrupoInfo(): Grupo {
    const stored = localStorage.getItem("grupoInfo");
    if (!stored) return createGrupo();
    try {
      return JSON.parse(stored);
    } catch {
      return createGrupo();
    }
  }

  // ===== SESSION END FLAG =====
  setSessionEnd(value: boolean): void {
    localStorage.setItem("sessionEnd", value ? "1" : "0");
  }

  getSessionEnd(): boolean {
    return localStorage.getItem("sessionEnd") === "1";
  }

  // ===== PREVIOUS PAGE (for navigation history) =====
  setPreviousPage(path: string): void {
    sessionStorage.setItem("previous-page", path);
  }

  getPreviousPage(): string | null {
    return sessionStorage.getItem("previous-page");
  }

  // ===== SESSION CLEANUP =====
  clearSession(): void {
    sessionStorage.clear();
  }

  clearAll(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
