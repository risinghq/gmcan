import type { Context, Next } from "hono";

import { DEFAULT_LOCALE, normalizeLocale } from "../lib/locales.js";

declare module "hono" {
  interface ContextVariableMap {
    locale: string;
  }
}

const PUBLIC_LOCALE_EXEMPT = new Set<string>(["/api/email"]);

export async function requirePublicLocale(c: Context, next: Next) {
  if (!c.req.path.startsWith("/api/")) return next();
  if (PUBLIC_LOCALE_EXEMPT.has(c.req.path)) return next();

  const acceptLanguage = (c.req.header("Accept-Language") ?? "").toLowerCase();
  const preferred = acceptLanguage
    .split(",")
    .map((token) => token.split(";")[0]?.trim())
    .filter(Boolean)
    .map((token) => token?.split("-")[0] ?? "");
  const matched = preferred.find((locale) => normalizeLocale(locale) === locale);
  const locale = matched ? normalizeLocale(matched) : DEFAULT_LOCALE;
  c.set("locale", locale);
  c.header("Content-Language", locale);
  c.header("Vary", "Accept-Language");
  await next();
}
