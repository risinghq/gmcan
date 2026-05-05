const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function monthYearEs(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const month = MONTHS_ES[date.getUTCMonth()] ?? "";
  const year = String(date.getUTCFullYear());
  if (!month) return year;
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}, ${year}`;
}
