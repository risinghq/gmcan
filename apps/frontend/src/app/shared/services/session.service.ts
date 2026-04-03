import { registerLocaleData } from "@angular/common";
import localeEnglish from "@angular/common/locales/en";
import localeSpanish from "@angular/common/locales/es";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class SessionService {
  private _locale: string;

  set locale(value: string) {
    this._locale = value;
  }
  get locale(): string {
    return localStorage.getItem("locale") || "es-Ar";
  }

  registerCulture(culture: string) {
    if (!culture) {
      return;
    }
    this.locale = culture;

    // Register locale data since only the en-US locale data comes with Angular
    switch (culture) {
      case "es-Ar": {
        localStorage.setItem("locale", "es-Ar");
        registerLocaleData("es-Ar");
        break;
      }
      case "en-US": {
        localStorage.setItem("locale", "en-US");
        registerLocaleData("en-US");
        break;
      }
    }
  }
}
