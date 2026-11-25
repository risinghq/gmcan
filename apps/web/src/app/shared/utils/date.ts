import { formatDate, registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";

// Labels are Spanish whatever the app locale, so this module registers the data it formats with.
registerLocaleData(localeEs);

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isValidDate(date) ? date : undefined;
}

function toLocalDisplayDate(value: Date): Date {
  const normalized = new Date(value);
  normalized.setMinutes(normalized.getMinutes() + normalized.getTimezoneOffset());
  return normalized;
}

export function parseLocalDate(value: string | null | undefined): Date | undefined {
  const parsed = parseDate(value);
  return parsed ? toLocalDisplayDate(parsed) : undefined;
}

/** A stored date in Spanish, in the given format: "junio, 2026". Empty for no date or an invalid one. */
export function dateText(value: string | null | undefined, format: string): string {
  const date = parseLocalDate(value);
  return date ? formatDate(date, format, "es") : "";
}

/** {@link dateText} capitalized as the start of a line: "Junio, 2026". */
export function dateLabel(value: string | null | undefined, format: string): string {
  const text = dateText(value, format);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function toIsoDate(value: Date): string {
  return new Date(value).toLocaleDateString("sv");
}
