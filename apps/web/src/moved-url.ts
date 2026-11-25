import { englishAppPath, languagePath, localeLanguage } from "./app/shared/site-language";
import { SPANISH_ONLY_PATHS } from "./seo-files";

const LEGACY_LANGUAGE_PARAM = "lang";
const LEGACY_PUBLIC_PREFIX = "/home";

function withoutLegacyPrefix(appPath: string): string {
  if (appPath === LEGACY_PUBLIC_PREFIX) return "/";
  return appPath.startsWith(`${LEGACY_PUBLIC_PREFIX}/`) ? appPath.slice(LEGACY_PUBLIC_PREFIX.length) : appPath;
}

function isSpanishOnly(appPath: string): boolean {
  return SPANISH_ONLY_PATHS.some((path) => appPath === path || appPath.startsWith(`${path}/`));
}

/**
 * Where an old or unsupported URL now lives, in one hop: public pages that sat under `/home`,
 * links shared as `?lang=en` before English moved to `/en`, and English URLs of the
 * Spanish-only dashboard. Undefined when the URL is current.
 */
export function movedLocation(url: URL): string | undefined {
  const query = new URLSearchParams(url.search);
  const legacyLanguage = query.get(LEGACY_LANGUAGE_PARAM);
  query.delete(LEGACY_LANGUAGE_PARAM);

  const englishPath = englishAppPath(url.pathname);
  const requestedPath = englishPath ?? url.pathname;
  const appPath = withoutLegacyPrefix(requestedPath);
  const wantsEnglish = legacyLanguage === null ? englishPath !== undefined : localeLanguage(legacyLanguage) === "en";
  const english = wantsEnglish && !isSpanishOnly(appPath);

  const current = legacyLanguage === null && appPath === requestedPath && english === (englishPath !== undefined);
  if (current) return undefined;

  const search = query.size ? `?${query}` : "";
  return languagePath(appPath, english ? "en" : "es") + search;
}
