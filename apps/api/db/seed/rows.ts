import type { LocaleCode } from "../schema.js";

export const today = new Date().toISOString().split("T")[0];

export function localeRows<T, R>(byLocale: Record<LocaleCode, T>, row: (locale: LocaleCode, value: T) => R): R[] {
  return Object.entries(byLocale).map(([locale, value]) => row(locale, value));
}
