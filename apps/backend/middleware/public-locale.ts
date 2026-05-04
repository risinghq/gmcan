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

  const lang = c.req.query("lang");
  if (lang !== "es" && lang !== "en") {
    return c.json({ error: "Invalid lang query" }, 400);
  }
  c.set("locale", lang);
  await next();
}
