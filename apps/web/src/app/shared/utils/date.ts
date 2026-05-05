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
