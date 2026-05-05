import { HTTPException } from "hono/http-exception";

import { LocaleCodeSchema, type LocaleCode } from "./locales.js";

export const LocaleSchema = LocaleCodeSchema;
export type Locale = LocaleCode;

export function localizeField<T extends Record<string, unknown>>(
  row: T,
  locale: Locale,
  source: { es: keyof T; en: keyof T; required?: boolean },
): string | null {
  const required = source.required ?? true;
  const esValue = row[source.es];
  const enValue = row[source.en];
  const value = locale === "en" ? enValue : esValue;

  if (value == null) {
    if (!required && esValue == null && enValue == null) return null;
    throwMissingTranslation(String(source.es));
  }
  const text = String(value).trim();
  if (text.length === 0) {
    if (!required && String(esValue ?? "").trim().length === 0 && String(enValue ?? "").trim().length === 0)
      return null;
    throwMissingTranslation(String(source.es));
  }
  return text;
}

export function throwMissingTranslation(field: string): never {
  throw new HTTPException(500, {
    res: new Response(JSON.stringify({ error: "Missing translation", code: "MISSING_TRANSLATION", field }), {
      status: 500,
      headers: { "content-type": "application/json" },
    }),
  });
}
