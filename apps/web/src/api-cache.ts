export interface ServiceBinding {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerContext {
  waitUntil(work: Promise<unknown>): void;
}

/** Freshness window before a colo asks the API for a new copy. */
export const FRESH_SECONDS = 60;
/**
 * Retention window for stale entries while the colo refreshes them in the background.
 * The cache has no purge, so an edit becomes visible when a refresh completes.
 */
export const STALE_SECONDS = 3600;

const CACHED_AT = "X-Cached-At";
const ORIGIN_CACHE_CONTROL = "X-Origin-Cache-Control";
const refreshing = new Set<string>();

/** Returns whether the API response may be shared between visitors. */
function isShareable(response: Response): boolean {
  const cacheControl = response.headers.get("Cache-Control") ?? "";
  return response.status === 200 && /\bpublic\b/.test(cacheControl) && /\bmax-age=[1-9]/.test(cacheControl);
}

/** Adds the metadata the colo needs to age and restore the API response. */
function toEntry(response: Response, retainSeconds: number): Response {
  const entry = new Response(response.body, response);
  entry.headers.set(ORIGIN_CACHE_CONTROL, response.headers.get("Cache-Control") ?? "");
  entry.headers.set(CACHED_AT, String(Date.now()));
  entry.headers.set("Cache-Control", `public, max-age=${retainSeconds}`);
  return entry;
}

/** Restores the API headers and labels how the colo served the response. */
function fromEntry(entry: Response, state: "HIT" | "STALE"): Response {
  const response = new Response(entry.body, entry);
  response.headers.set("Cache-Control", entry.headers.get(ORIGIN_CACHE_CONTROL) ?? "");
  response.headers.delete(ORIGIN_CACHE_CONTROL);
  response.headers.delete(CACHED_AT);
  response.headers.set("X-Cache", state);
  return response;
}

async function refreshEntry(request: Request, api: ServiceBinding, cache: Cache, key: Request, retainSeconds: number) {
  try {
    const response = await api.fetch(request);
    if (isShareable(response)) await cache.put(key, toEntry(response, retainSeconds));
    else await cache.delete(key);
  } finally {
    refreshing.delete(key.url);
  }
}

/**
 * Serves public API reads from the colo's cache. Stale entries remain available while they refresh
 * in the background. The API picks the content language from Accept-Language, so the language is
 * part of the cache key.
 */
export async function cachedApiFetch(
  request: Request,
  api: ServiceBinding,
  cache: Cache,
  ctx?: WorkerContext,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (request.method !== "GET" || pathname.startsWith("/api/email/")) return api.fetch(request);

  const keyUrl = new URL(request.url);
  keyUrl.searchParams.set("__language", request.headers.get("Accept-Language") ?? "");
  const key = new Request(keyUrl, { method: "GET" });
  // A deleted asset must stop being served within the fresh period, so assets are never served stale.
  const retainSeconds = pathname.startsWith("/api/assets/") ? FRESH_SECONDS : FRESH_SECONDS + STALE_SECONDS;

  const hit = await cache.match(key);
  if (hit) {
    const ageSeconds = (Date.now() - Number(hit.headers.get(CACHED_AT))) / 1000;
    if (ageSeconds < FRESH_SECONDS) return fromEntry(hit, "HIT");
    if (ctx && retainSeconds > FRESH_SECONDS) {
      if (!refreshing.has(key.url)) {
        refreshing.add(key.url);
        ctx.waitUntil(refreshEntry(request, api, cache, key, retainSeconds));
      }
      return fromEntry(hit, "STALE");
    }
  }

  const response = await api.fetch(request);
  if (!isShareable(response)) return response;
  ctx?.waitUntil(cache.put(key, toEntry(response.clone(), retainSeconds)));
  const miss = new Response(response.body, response);
  miss.headers.set("X-Cache", "MISS");
  return miss;
}
