import { z } from "zod";

import { env } from "../config/env.js";

export const ADMIN_LOCALES = env.ADMIN_LOCALES;
export const LocaleSchema = z.enum(["es", "en"]);
export type AdminLocale = z.infer<typeof LocaleSchema>;

export function translationsSchema<TShape extends z.ZodRawShape>(shape: TShape) {
  const payload = z.object({
    es: z.object(shape),
    en: z.object(shape),
  });
  return payload.superRefine((value, ctx) => {
    const keys = Object.keys(value);
    for (const locale of ADMIN_LOCALES) {
      if (!keys.includes(locale)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing translations.${locale}`,
        });
      }
    }
  });
}

export type Bilingual<T> = { es: T; en: T };
