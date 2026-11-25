import { AngularAppEngine, createRequestHandler } from "@angular/ssr";

import { englishAppPath, languagePath, localeLanguage } from "./app/shared/site-language";
import { cachedApiFetch, cachedPageFetch, type ServiceBinding, type WorkerContext } from "./edge-cache";
import { applyRuntimeConfig, currentRuntimeConfig } from "./runtime-config";
import { robotsTxt, sitemapResponse, SPANISH_ONLY_PATHS } from "./seo-files";

interface WebEnv {
  /** The API worker served under /api and /admin so the browser stays on one origin. */
  API?: ServiceBinding;
  ASSETS?: ServiceBinding;
  /** The site's canonical public URL, defaulting to the request origin. */
  APP_URL?: string;
  CF_VERSION_METADATA?: { id: string };
}

const LEGACY_LANGUAGE_PARAM = "lang";

// Cloudflare reports the scheme after terminating TLS.
// The host always comes from the request itself.
const engine = new AngularAppEngine({ trustProxyHeaders: ["x-forwarded-proto"] });
const nativeFetch = globalThis.fetch.bind(globalThis);
let routedOrigin: string | undefined;

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/admin/");
}

function edgeCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

/** Routes SSR calls for the site's origin to the API worker's service binding. */
function routeApiCalls(env: WebEnv, origin: string): void {
  const api = env.API;
  if (!api || routedOrigin === origin) return;
  routedOrigin = origin;
  globalThis.fetch = async (input, init) => {
    // The Workers runtime rejects the `credentials` option.
    const { credentials: _credentials, ...rest } = init ?? {};
    const request = new Request(input, rest);
    const url = new URL(request.url);
    if (url.origin === origin && isApiPath(url.pathname)) return api.fetch(request);
    return nativeFetch(request);
  };
}

/**
 * Points old and unsupported URLs at the page that serves them: links shared as `?lang=en`
 * before English moved to `/en`, and English URLs of the Spanish-only dashboard.
 */
function movedLocation(url: URL): string | undefined {
  const legacyLanguage = url.searchParams.get(LEGACY_LANGUAGE_PARAM);
  if (legacyLanguage !== null) {
    const query = new URLSearchParams(url.search);
    query.delete(LEGACY_LANGUAGE_PARAM);
    const search = query.size ? `?${query}` : "";
    const appPath = englishAppPath(url.pathname) ?? url.pathname;
    return languagePath(appPath, localeLanguage(legacyLanguage)) + search;
  }

  const englishPath = englishAppPath(url.pathname);
  const spanishOnly = SPANISH_ONLY_PATHS.some((path) => englishPath === path || englishPath?.startsWith(`${path}/`));
  return spanishOnly ? englishPath + url.search : undefined;
}

/** Browsers revalidate pages on every visit; the colo's copy is what keeps them fast. */
async function renderPage(request: Request, env: WebEnv): Promise<Response> {
  const rendered = await engine.handle(request);
  if (!rendered) return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
  if (rendered.headers.has("Cache-Control")) return rendered;
  const response = new Response(rendered.body, rendered);
  response.headers.set("Cache-Control", "no-cache");
  return response;
}

async function handle(request: Request, env: WebEnv = {}, ctx?: WorkerContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = env.APP_URL ?? url.origin;
  if (env.API) applyRuntimeConfig({ apiUrl: origin, appUrl: origin });

  if (url.pathname === "/config.json") {
    return Response.json(currentRuntimeConfig(), { headers: { "Cache-Control": "no-store" } });
  }
  if (url.pathname === "/robots.txt") return robotsTxt(origin);

  const api = env.API;
  if (api && url.pathname === "/sitemap.xml") {
    return sitemapResponse(origin, () =>
      cachedApiFetch(new Request(`${url.origin}/api/sitemap`), api, edgeCache(), ctx),
    );
  }
  if (api && isApiPath(url.pathname)) return cachedApiFetch(request, api, edgeCache(), ctx);

  const moved = movedLocation(url);
  if (moved) return Response.redirect(new URL(moved, url.origin), 301);

  routeApiCalls(env, origin);
  if (!api) return renderPage(request, env);
  const version = env.CF_VERSION_METADATA?.id ?? "local";
  return cachedPageFetch(request, version, () => renderPage(request, env), edgeCache(), ctx);
}

export const reqHandler = createRequestHandler((request) => handle(request));

export default { fetch: handle };
