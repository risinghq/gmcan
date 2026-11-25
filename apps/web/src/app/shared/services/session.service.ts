import { Injectable, LOCALE_ID, inject, signal } from "@angular/core";
import { Languages } from "@app/shared/models/languages";
import { localeLanguage } from "@app/shared/site-language";

@Injectable({ providedIn: "root" })
export class SessionService {
  readonly siteLanguage = localeLanguage(inject(LOCALE_ID));
  readonly language = signal(Languages[this.siteLanguage === "en" ? 1 : 0]).asReadonly();
}
