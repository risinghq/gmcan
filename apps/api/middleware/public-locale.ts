import type { Context, Next } from "hono";

import { DEFAULT_LOCALE, normalizeLocale } from "../lib/locales.js";
import type { Locale } from "../lib/public-locale.js";

declare module "hono" {
  interface ContextVariableMap {
    locale: Locale;
  }
}

function resolveRequestLocale(c: Context): Locale {
  const acceptLanguage = (c.req.header("Accept-Language") ?? "").toLowerCase();
  const preferred = acceptLanguage
    .split(",")
    .map((token) => token.split(";")[0]?.trim())
    .filter(Boolean)
    .map((token) => token?.split("-")[0] ?? "");
  const matched = preferred.find((locale) => normalizeLocale(locale) === locale);
  return matched ? normalizeLocale(matched) : DEFAULT_LOCALE;
}

export async function requireRequestLocale(c: Context, next: Next) {
  const locale = resolveRequestLocale(c);
  c.set("locale", locale);
  c.header("Content-Language", locale);
  c.header("Vary", "Accept-Language");
  await next();
}
