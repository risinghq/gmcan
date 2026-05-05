import { z } from "zod";

import { env } from "../config/env.js";

function parseLocales(raw: string | undefined): Array<"es" | "en"> {
  const values = raw
    ?.split(",")
    .map((v) => v.trim())
    .filter((v): v is "es" | "en" => v === "es" || v === "en");
  if (!values || values.length === 0) return ["es", "en"];
  if (!values.includes("es") || !values.includes("en")) return ["es", "en"];
  return values;
}

export const ADMIN_LOCALES = parseLocales(env.ADMIN_LOCALES);
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
          code: "custom",
          message: `Missing translations.${locale}`,
        });
      }
    }
  });
}

export type Bilingual<T> = { es: T; en: T };
