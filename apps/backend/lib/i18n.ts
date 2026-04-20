import type { Context } from "hono";

export function getLocale(c: Context): "en" | "es" {
  const lang = c.req.header("Accept-Language") ?? "";
  return lang.toLowerCase().includes("en") ? "en" : "es";
}
