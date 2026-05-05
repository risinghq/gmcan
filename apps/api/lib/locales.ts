import { z } from "zod";

import { env } from "../config/env.js";

function parseConfiguredLocales(raw: string | undefined): string[] {
  const values = (raw ?? "es,en")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v.length > 0);

  const unique = Array.from(new Set(values));
  if (unique.length === 0) return ["es", "en"];
  return unique;
}

export const SUPPORTED_LOCALES = Object.freeze(parseConfiguredLocales(env.SUPPORTED_LOCALES));

const configuredDefault = (env.DEFAULT_LOCALE ?? "").trim().toLowerCase();
export const DEFAULT_LOCALE =
  configuredDefault.length > 0 && SUPPORTED_LOCALES.includes(configuredDefault)
    ? configuredDefault
    : (SUPPORTED_LOCALES[0] ?? "es");

export const LocaleCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => SUPPORTED_LOCALES.includes(value), {
    message: `Unsupported locale. Supported locales: ${SUPPORTED_LOCALES.join(", ")}`,
  });

export type LocaleCode = string;
export type LocalizedMap<T> = Record<string, T>;

export function isSupportedLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale.toLowerCase());
}

export function normalizeLocale(locale: string | undefined | null): LocaleCode {
  const normalized = (locale ?? "").trim().toLowerCase();
  if (isSupportedLocale(normalized)) return normalized;
  return DEFAULT_LOCALE;
}

export function assertLocale(locale: string): LocaleCode {
  return LocaleCodeSchema.parse(locale);
}

export function makeLocalizedMapSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.record(z.string(), valueSchema).superRefine((value, ctx) => {
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
