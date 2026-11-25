export interface ServiceBinding {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerContext {
  waitUntil(work: Promise<unknown>): void;
}

/** Freshness window before a colo asks the origin for a new copy. */
export const FRESH_SECONDS = 60;
/**
 * Retention window for stale entries while the colo refreshes them in the background.
 * The cache has no purge, so an edit becomes visible when a refresh completes.
 */
export const STALE_SECONDS = 3600;

const CACHED_AT = "X-Cached-At";
const ORIGIN_CACHE_CONTROL = "X-Origin-Cache-Control";
const refreshing = new Set<string>();

interface CachePolicy {
  key: Request;
  retainSeconds: number;
  isShareable(response: Response): boolean;
}

/** Adds the metadata the colo needs to age and restore the origin response. */
function toEntry(response: Response, retainSeconds: number): Response {
  const entry = new Response(response.body, response);
  entry.headers.set(ORIGIN_CACHE_CONTROL, response.headers.get("Cache-Control") ?? "");
  entry.headers.set(CACHED_AT, String(Date.now()));
  entry.headers.set("Cache-Control", `public, max-age=${retainSeconds}`);
  return entry;
}

/** Restores the origin headers and labels how the colo served the response. */
function fromEntry(entry: Response, state: "HIT" | "STALE"): Response {
  const response = new Response(entry.body, entry);
  response.headers.set("Cache-Control", entry.headers.get(ORIGIN_CACHE_CONTROL) ?? "");
  response.headers.delete(ORIGIN_CACHE_CONTROL);
  response.headers.delete(CACHED_AT);
  response.headers.set("X-Cache", state);
  return response;
}

async function refreshEntry(load: () => Promise<Response>, cache: Cache, policy: CachePolicy): Promise<void> {
  try {
    const response = await load();
    if (policy.isShareable(response)) await cache.put(policy.key, toEntry(response, policy.retainSeconds));
    else await cache.delete(policy.key);
  } finally {
    refreshing.delete(policy.key.url);
  }
}

/** Serves from the colo's cache, keeping stale entries available while they refresh in the background. */
async function serveCached(
  load: () => Promise<Response>,
  cache: Cache,
  policy: CachePolicy,
  ctx?: WorkerContext,
): Promise<Response> {
  const hit = await cache.match(policy.key);
  if (hit) {
    const ageSeconds = (Date.now() - Number(hit.headers.get(CACHED_AT))) / 1000;
    if (ageSeconds < FRESH_SECONDS) return fromEntry(hit, "HIT");
    if (ctx && policy.retainSeconds > FRESH_SECONDS) {
      if (!refreshing.has(policy.key.url)) {
        refreshing.add(policy.key.url);
        ctx.waitUntil(refreshEntry(load, cache, policy));
      }
      return fromEntry(hit, "STALE");
    }
  }

  const response = await load();
  if (!policy.isShareable(response)) return response;
  ctx?.waitUntil(cache.put(policy.key, toEntry(response.clone(), policy.retainSeconds)));
  const miss = new Response(response.body, response);
  miss.headers.set("X-Cache", "MISS");
  return miss;
}

function languageKey(url: string, language: string): Request {
  const keyUrl = new URL(url);
  keyUrl.searchParams.set("__language", language);
  return new Request(keyUrl, { method: "GET" });
}

/** Returns whether the API marked the response as safe to share between visitors. */
function isShareableApiResponse(response: Response): boolean {
  const cacheControl = response.headers.get("Cache-Control") ?? "";
  return response.status === 200 && /\bpublic\b/.test(cacheControl) && /\bmax-age=[1-9]/.test(cacheControl);
}

/** Public pages differ only by URL and language, so a rendered page is shared unless it sets a cookie. */
function isShareablePage(response: Response): boolean {
  return (
    response.status === 200 &&
    (response.headers.get("Content-Type") ?? "").startsWith("text/html") &&
    !response.headers.has("Set-Cookie")
  );
}

/** Serves public API reads from the colo's cache. The API picks the content language from Accept-Language. */
export function cachedApiFetch(
  request: Request,
  api: ServiceBinding,
  cache: Cache,
  ctx?: WorkerContext,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (request.method !== "GET" || pathname.startsWith("/api/email/")) return api.fetch(request);

  return serveCached(
    () => api.fetch(request),
    cache,
    {
      key: languageKey(request.url, request.headers.get("Accept-Language") ?? ""),
      retainSeconds: pathname.startsWith("/api/assets/") ? FRESH_SECONDS : FRESH_SECONDS + STALE_SECONDS,
      isShareable: isShareableApiResponse,
    },
    ctx,
  );
}

/** Serves server-rendered pages from the colo's cache, one entry per URL and resolved language. */
export function cachedPageFetch(
  request: Request,
  language: string,
  render: () => Promise<Response>,
  cache: Cache,
  ctx?: WorkerContext,
): Promise<Response> {
  if (request.method !== "GET") return render();

  return serveCached(
    render,
    cache,
    {
      key: languageKey(request.url, language),
      retainSeconds: FRESH_SECONDS + STALE_SECONDS,
      isShareable: isShareablePage,
    },
    ctx,
  );
}
