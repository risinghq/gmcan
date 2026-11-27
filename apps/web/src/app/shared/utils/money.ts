import { Pipe, PipeTransform } from "@angular/core";

/** The group is Peruvian: es-PE writes S/ 62,000.00, where es would write 62.000,00 S/. */
const INTL_LOCALE: Record<string, string> = { es: "es-PE", en: "en-US" };

export function moneyLabel(minor: number, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    currencyDisplay: "narrowSymbol",
  }).format(minor / 100);
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

@Pipe({ name: "money" })
export class MoneyPipe implements PipeTransform {
  transform(minor: number, currencyCode: string, locale: string): string {
    return moneyLabel(minor, currencyCode, locale);
  }
}
