import { z } from "zod";

import { SUPPORTED_LOCALES, type LocaleCode, type LocalizedMap } from "./locales.js";

export const ADMIN_LOCALES = SUPPORTED_LOCALES;
export const LocaleSchema = z.string().refine((value) => ADMIN_LOCALES.includes(value), {
  message: "Unsupported locale",
});
export type AdminLocale = LocaleCode;

export function translationsSchema<TShape extends z.ZodRawShape>(shape: TShape) {
  const itemSchema = z.object(shape);
  return z
    .object({
      es: itemSchema,
      en: itemSchema,
    })
    .catchall(itemSchema)
    .superRefine((value, ctx) => {
      const keys = new Set(Object.keys(value));
      for (const locale of SUPPORTED_LOCALES) {
        if (!keys.has(locale)) {
          ctx.addIssue({ code: "custom", message: `Missing translations.${locale}` });
        }
      }

      for (const key of keys) {
        if (!SUPPORTED_LOCALES.includes(key)) {
          ctx.addIssue({ code: "custom", message: `Unsupported locale key: ${key}` });
        }
      }
    });
}

export type Bilingual<T> = LocalizedMap<T> & { es: T; en: T };
