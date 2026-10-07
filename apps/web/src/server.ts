import { AngularAppEngine, createRequestHandler } from "@angular/ssr";

import { applyRuntimeConfig, currentRuntimeConfig } from "./runtime-config";

interface ServiceBinding {
  fetch(request: Request): Promise<Response>;
}

interface WorkerContext {
  waitUntil(work: Promise<unknown>): void;
}

interface WebEnv {
  /** The API worker served under /api and /admin so the browser stays on one origin. */
  API?: ServiceBinding;
  ASSETS?: ServiceBinding;
  /** The site's canonical public URL, defaulting to the request origin. */
  APP_URL?: string;
}

// Cloudflare reports the scheme after terminating TLS.
// The host always comes from the request itself.
const engine = new AngularAppEngine({ trustProxyHeaders: ["x-forwarded-proto"] });
const nativeFetch = globalThis.fetch.bind(globalThis);
let routedOrigin: string | undefined;

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/admin/");
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

/** How long a colo keeps an API response. Nothing purges it, so this bounds how stale an edit can look. */
const EDGE_CACHE_CONTROL = "public, max-age=60";

/** Whether the API marked the response as shareable between visitors. */
function isShareable(response: Response): boolean {
  const cacheControl = response.headers.get("Cache-Control") ?? "";
  return response.status === 200 && /\bpublic\b/.test(cacheControl) && /\bmax-age=[1-9]/.test(cacheControl);
}

/**
 * Serves public API reads from the colo's cache. A miss costs the hop to the API worker, which
 * runs beside the database, so repeat reads skip that hop and every query behind it. The API
 * picks the content language from Accept-Language, so the language is part of the cache key.
 */
async function cachedApiFetch(request: Request, api: ServiceBinding, ctx?: WorkerContext): Promise<Response> {
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/email/")) return api.fetch(request);

  const keyUrl = new URL(request.url);
  keyUrl.searchParams.set("__language", request.headers.get("Accept-Language") ?? "");
  const key = new Request(keyUrl, { method: "GET" });
  const cache = (caches as unknown as { default: Cache }).default;

  const hit = await cache.match(key);
  if (hit) return withHeader(hit, "X-Cache", "HIT");

  const response = await api.fetch(request);
  if (!isShareable(response)) return response;
  // Assets are immutable for a year in the browser, but the edge copy still expires after a minute
  // so a deleted asset stops being served.
  ctx?.waitUntil(cache.put(key, withHeader(response.clone(), "Cache-Control", EDGE_CACHE_CONTROL)));
  return withHeader(response, "X-Cache", "MISS");
}

function withHeader(response: Response, name: string, value: string): Response {
  const copy = new Response(response.body, response);
  copy.headers.set(name, value);
  return copy;
}

async function handle(request: Request, env: WebEnv = {}, ctx?: WorkerContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = env.APP_URL ?? url.origin;
  if (env.API) applyRuntimeConfig({ apiUrl: origin, appUrl: origin });

  if (url.pathname === "/config.json") {
    return Response.json(currentRuntimeConfig(), { headers: { "Cache-Control": "no-store" } });
  }
  if (env.API && isApiPath(url.pathname)) return cachedApiFetch(request, env.API, ctx);

  routeApiCalls(env, origin);
  const response = await engine.handle(request);
  if (response) return response;
  return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
}

export const reqHandler = createRequestHandler((request) => handle(request));

export default { fetch: handle };
