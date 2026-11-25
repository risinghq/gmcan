export type SiteLanguage = "es" | "en";

export const LANGUAGE_PARAM = "lang";
export const LANGUAGE_COOKIE = "lang";
export const DEFAULT_LANGUAGE: SiteLanguage = "es";

function parse(value: string | null | undefined): SiteLanguage | undefined {
  const tag = value?.trim().toLowerCase();
  if (!tag) return undefined;
  return tag.startsWith("en") ? "en" : "es";
}

function cookieValue(cookieHeader: string | null | undefined, name: string): string | undefined {
  for (const part of cookieHeader?.split(";") ?? []) {
    const [key, ...rest] = part.split("=");
    if (key?.trim() === name) return rest.join("=").trim();
  }
  return undefined;
}

/**
 * The server and the browser must pick the same language, or hydration repaints the page.
 * An explicit `lang` query parameter wins, so each language has a crawlable URL; then the saved choice,
 * then the visitor's first preferred language.
 */
export function resolveSiteLanguage(source: {
  url: string;
  cookie?: string | null;
  acceptLanguage?: string | null;
}): SiteLanguage {
  const fromUrl = new URL(source.url, "http://site").searchParams.get(LANGUAGE_PARAM);
  return (
    parse(fromUrl) ??
    parse(cookieValue(source.cookie, LANGUAGE_COOKIE)) ??
    parse(source.acceptLanguage?.split(",")[0]?.split(";")[0]) ??
    DEFAULT_LANGUAGE
  );
}

/** Names the language even for Spanish, because a bare URL would fall back to the saved choice. */
export function languageSwitchHref(path: string, language: SiteLanguage): string {
  const url = new URL(path, "http://site");
  url.searchParams.set(LANGUAGE_PARAM, language);
  return url.pathname + url.search + url.hash;
}

export function languageCookie(language: SiteLanguage): string {
  return `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
