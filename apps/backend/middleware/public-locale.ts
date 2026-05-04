import type { Context, Next } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    locale: "es" | "en";
  }
}

const PUBLIC_LOCALE_EXEMPT = new Set<string>(["/api/email"]);

export async function requirePublicLocale(c: Context, next: Next) {
  if (!c.req.path.startsWith("/api/")) return next();
  if (PUBLIC_LOCALE_EXEMPT.has(c.req.path)) return next();

  const acceptLanguage = (c.req.header("Accept-Language") ?? "").toLowerCase();
  const locale: "es" | "en" = acceptLanguage.includes("en") ? "en" : "es";
  c.set("locale", locale);
  c.header("Content-Language", locale);
  c.header("Vary", "Accept-Language");
  await next();
}
