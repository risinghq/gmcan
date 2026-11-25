import { type AbstractControl, FormGroup } from "@angular/forms";
import type { Translations } from "@gmcan/contracts/admin";

import { Languages } from "../models/languages";

/** The locales an admin write must cover. The API rejects a write that misses one of its SUPPORTED_LOCALES. */
export const CONTENT_LOCALES: readonly string[] = Languages.map((language) => language.locale);

const LOCALE_LABELS: Record<string, string> = { es: "Español", en: "English" };

export function localeLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale;
}

export type LocaleForm<C extends Record<string, AbstractControl>> = FormGroup<Record<string, FormGroup<C>>>;

/** One group per content locale, each built fresh by `build`. */
export function localeForm<C extends Record<string, AbstractControl>>(build: () => C): LocaleForm<C> {
  return new FormGroup(Object.fromEntries(CONTENT_LOCALES.map((locale) => [locale, new FormGroup(build())])));
}

/** The name an admin list shows: the first content locale that has one. */
export function primaryName(translations: Translations<{ name: string }>): string {
  for (const locale of CONTENT_LOCALES) {
    const name = translations[locale]?.name;
    if (name) return name;
  }
  return "";
}
