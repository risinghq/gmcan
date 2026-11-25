export type SiteLanguage = "es" | "en";

/** Matches the `subPath` of the English locale in angular.json; Spanish is the source locale at the root. */
const ENGLISH_PREFIX = "/en";

export function localeLanguage(localeId: string): SiteLanguage {
  return localeId.toLowerCase().startsWith("en") ? "en" : "es";
}

/** Prefixes an app path, with its query and fragment, for the locale build that serves the language. */
export function languagePath(path: string, language: SiteLanguage): string {
  if (language === "es") return path;
  return path === "/" ? `${ENGLISH_PREFIX}/` : `${ENGLISH_PREFIX}${path}`;
}

/** Maps a site URL to the app path the locale build routes, or undefined for the Spanish build. */
export function englishAppPath(pathname: string): string | undefined {
  if (pathname === ENGLISH_PREFIX) return "/";
  return pathname.startsWith(`${ENGLISH_PREFIX}/`) ? pathname.slice(ENGLISH_PREFIX.length) : undefined;
}
