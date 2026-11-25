import { formatDate } from "@angular/common";

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

export function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isValidDate(date) ? date : undefined;
}

export function toLocalDisplayDate(value: Date): Date {
  const normalized = new Date(value);
  normalized.setMinutes(normalized.getMinutes() + normalized.getTimezoneOffset());
  return normalized;
}

export function parseLocalDate(value: string | null | undefined): Date | undefined {
  const parsed = parseDate(value);
  return parsed ? toLocalDisplayDate(parsed) : undefined;
}

/** A Spanish date label for a stored date, capitalized as the start of a line: "Junio, 2026". Empty for no date. */
export function dateLabel(value: string | null | undefined, format: string): string {
  const date = parseLocalDate(value);
  if (!date) return "";
  const label = formatDate(date, format, "es");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function requireLocalDate(value: string | null | undefined, field: string): Date {
  const parsed = parseLocalDate(value);
  if (!parsed) {
    throw new Error(`Invalid required date field: ${field}`);
  }
  return parsed;
}

export function toIsoDate(value: Date): string {
  return new Date(value).toLocaleDateString("sv");
}
